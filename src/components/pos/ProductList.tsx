import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { toast } from 'sonner';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductCard } from './product-card';
import { ProductListError } from './product-list-error';
import { ProductSkeleton } from '@/components/ui/skeletons/ProductSkeleton';

// Icons
import { Search, RefreshCw, X, Package } from 'lucide-react';

// Types & Utilities
import { CartItem, Product } from '@/types';
import { cn } from '@/lib/utils';
import { useProductState } from '@/store';
import { useListProducts } from '@/lib/services/products';

// --- TYPE DEFINITIONS ---
interface ProductListProps {
  onAddToCart: (product: CartItem) => void;
}

interface ScanPayload {
  message: string;
}

type SortOption = 'relevance' | 'name' | 'price' | 'category';

// --- HELPER FUNCTIONS ---
/**
 * Creates a unique key for a product, optionally with a variant.
 * This ensures that state for different variants of the same product is handled correctly.
 * @param productId - The ID of the product.
 * @param variantName - The name of the selected variant (optional).
 * @returns A unique string identifier.
 */
const getProductKey = (productId: string, variantName?: string): string => {
  return variantName ? `${productId}-${variantName}` : productId;
};

// --- FUZZY SEARCH UTILITIES ---
// Note: These complex functions are prime candidates for extraction into a separate `utils/search.ts` file.

const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Keep only alphanumeric characters and spaces
    .replace(/\s+/g, ' ')
    .trim();
};

const calculateLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // Deletion
        matrix[j - 1][i] + 1, // Insertion
        matrix[j - 1][i - 1] + indicator // Substitution
      );
    }
  }
  return matrix[b.length][a.length];
};

const getFuzzyMatchScore = (searchTerm: string, targetString: string): number => {
  const normalizedSearch = normalizeString(searchTerm);
  const normalizedTarget = normalizeString(targetString);

  if (!normalizedSearch) return 100; // If search is empty, everything is a perfect match.
  if (!normalizedTarget) return 0; // If target is empty, no match.
  if (normalizedTarget.includes(normalizedSearch)) return 100; // Perfect substring match is highest score.

  const words = normalizedSearch.split(' ');
  let totalScore = 0;

  for (const word of words) {
    let bestWordScore = 0;
    if (normalizedTarget.includes(word)) {
      bestWordScore = 1; // Direct word match
    } else {
      const targetWords = normalizedTarget.split(' ');
      for (const targetWord of targetWords) {
        const distance = calculateLevenshteinDistance(word, targetWord);
        const similarity = 1 - distance / Math.max(word.length, targetWord.length);
        if (similarity > bestWordScore) {
          bestWordScore = similarity;
        }
      }
    }
    // We only consider scores above a certain threshold to be relevant.
    totalScore += bestWordScore > 0.7 ? bestWordScore : 0;
  }
  return (totalScore / words.length) * 100;
};

// --- MAIN COMPONENT ---
export function ProductList({ onAddToCart }: ProductListProps) {
  // --- 1. STATE & DATA FETCHING ---
  const { data: products = [], isLoading, error, refetch } = useListProducts();
  const { selectedCategory, setSelectedCategory } = useProductState();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isRetrying, setIsRetrying] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- 2. MEMOIZED VALUES & DERIVED STATE ---

  /**
   * Memoized list of available categories derived from the product list.
   * Using useMemo prevents this array from being recalculated on every render.
   */
  const availableCategories: string[] = useMemo(
    () => ['All', ...new Set(products.map(p => p.category?.name).filter(Boolean) as string[])],
    [products]
  );

  /**
   * Memoized and optimized product filtering and sorting logic.
   * - Filters by category.
   * - Filters by search query, calculating a relevance score ONCE per product.
   * - Sorts the results based on the selected sort option, using the pre-calculated
   * score for 'relevance' sorting to maximize performance.
   */
  const filteredAndSortedProducts = useMemo(() => {
    // Step 1: Filter by the selected category
    const categoryFiltered =
      selectedCategory === 'All' ? products : products.filter(p => p.category?.name === selectedCategory);

    // Step 2: If a search query exists, score and filter by it
    let scoredProducts;
    if (debouncedSearchQuery) {
      scoredProducts = categoryFiltered
        .map(product => {
          // Calculate a score based on matches in name, category, barcode, and variants
          const nameScore = getFuzzyMatchScore(debouncedSearchQuery, product.name);
          const barcodeScore = product.barcode ? getFuzzyMatchScore(debouncedSearchQuery, product.barcode) : 0;
          const categoryScore = product.category?.name
            ? getFuzzyMatchScore(debouncedSearchQuery, product.category.name)
            : 0;
          const maxVariantScore = product.variants?.length
            ? Math.max(...product.variants.map(v => getFuzzyMatchScore(debouncedSearchQuery, v.name)))
            : 0;

          const score = Math.max(nameScore, barcodeScore, categoryScore, maxVariantScore);
          return { product, score };
        })
        .filter(item => item.score > 30); // Only include items with a reasonable match score
    } else {
      // If no search query, all items have a default score of 0
      scoredProducts = categoryFiltered.map(product => ({ product, score: 0 }));
    }

    // Step 3: Sort the results
    const sorted = scoredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.score - a.score; // Higher score first
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'price': {
          const aPrice = parseFloat(a.product.variants?.[0]?.price || '0');
          const bPrice = parseFloat(b.product.variants?.[0]?.price || '0');
          return aPrice - bPrice;
        }
        case 'category':
          return (a.product.category?.name || '').localeCompare(b.product.category?.name || '');
        default:
          return 0;
      }
    });

    // Step 4: Return just the product objects
    return sorted.map(item => item.product);
  }, [products, selectedCategory, debouncedSearchQuery, sortBy]);

  // --- 3. CALLBACKS & EVENT HANDLERS ---

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  /**
   * Robustly handles adding a product to the cart.
   * Ensures the selected variant exists and all required data is present.
   */
  const handleAddToCart = useCallback(
    (product: Product) => {
      try {
        const productId = product.id;
        const selectedVariantName = selectedVariants[productId] || product.variants?.[0]?.name;

        if (!selectedVariantName) {
          toast.error(`No variants available for ${product.name}.`);
          return;
        }

        const variantDetails = product.variants?.find(v => v.name === selectedVariantName);

        if (!variantDetails) {
          toast.error(`Variant "${selectedVariantName}" not found for ${product.name}.`);
          return;
        }

        const sellingUnit = variantDetails.sellingUnits?.[0];
        if (!sellingUnit) {
          toast.error(`No selling unit configured for ${product.name} - ${variantDetails.name}.`);
          return;
        }

        const productKey = getProductKey(productId, selectedVariantName);
        const quantity = quantities[productKey] || 1;

        if (quantity <= 0) {
          toast.info('Please set a quantity greater than zero.');
          return;
        }

        const cartItem: CartItem = {
          id: productKey,
          name: product.name,
          price: variantDetails.price,
          quantity: quantity,
          productId: productId,
          variant: selectedVariantName,
          image: product.image,
          variantId: variantDetails.id,
          sellingUnitId: sellingUnit.id,
        };

        onAddToCart(cartItem);
        // Don't reset quantity for this item in the list after adding to cart
        // This allows the quantity to be updated when the item is already in the cart
        toast.success(`${product.name} (${selectedVariantName}) added to cart.`);
      } catch (err) {
        console.error('Error adding to cart:', err);
        toast.error('Failed to add item to cart. Please check console for details.');
      }
    },
    [quantities, selectedVariants, onAddToCart]
  );

  const handleRefetch = useCallback(async () => {
    setIsRetrying(true);
    try {
      await refetch();
      toast.success('Products list refreshed');
    } catch (err) {
      console.error('Failed to refetch products:', err);
      toast.error('Failed to refresh products');
    } finally {
      setIsRetrying(false);
    }
  }, [refetch]);

  const updateQuantity = useCallback((productId: string, variantName: string | undefined, delta: number) => {
    const productKey = getProductKey(productId, variantName);
    setQuantities(prev => {
      const currentQty = prev[productKey] || 0;
      const newQty = Math.max(0, currentQty + delta); // Prevent negative quantities
      return { ...prev, [productKey]: newQty };
    });
  }, []);

  const handleVariantSelect = useCallback((productId: string, variantName: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantName }));
  }, []);

  // --- 4. EFFECTS ---

  /**
   * Effect to debounce the user's search input.
   * This prevents excessive re-calculations while the user is typing.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Effect to set up the barcode scanner listener via Tauri events.
   * It cleans up the listener when the component unmounts.
   */
  useEffect(() => {
    if (products.length === 0) return;

    const setupListener = async () => {
      return await listen<ScanPayload>('scanner-data', event => {
        const barcode = event.payload.message.trim();
        if (!barcode) return;

        const foundProduct = products.find(p => p.barcode === barcode);

        if (foundProduct) {
          handleAddToCart(foundProduct);
        } else {
          toast.error('Product not found', { description: `Barcode: ${barcode}` });
        }
      });
    };

    const unlistenPromise = setupListener();

    return () => {
      unlistenPromise.then(unlistenFn => unlistenFn());
    };
  }, [products, handleAddToCart]);

  /**
   * Effect to handle global keyboard shortcuts for better accessibility and speed.
   * - Ctrl/Cmd + K to focus search.
   * - Typing any character focuses search if not already in an input.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (!isTyping && e.key.match(/^[a-zA-Z0-9]$/)) {
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- 5. RENDER LOGIC ---

  const renderContent = () => {
    if (error) {
      return <ProductListError error={error} onRetry={handleRefetch} isRetrying={isRetrying} />;
    }
    if (isLoading) {
      return <ProductSkeleton />;
    }
    if (filteredAndSortedProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">No Products Found</h3>
          <p className="mt-2">
            {debouncedSearchQuery
              ? `Your search for "${debouncedSearchQuery}" did not match any products.`
              : 'There are no products available in this category.'}
          </p>
          {debouncedSearchQuery && (
            <Button variant="outline" onClick={clearSearch} className="mt-4">
              Clear Search
            </Button>
          )}
        </div>
      );
    }
    return (
      <ScrollArea className="h-full pr-4 -mr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedProducts.map(product => {
            const productId = product.id;
            const selectedVariantName = selectedVariants[productId] || product.variants?.[0]?.name;
            const productKey = getProductKey(productId, selectedVariantName);
            const currentQuantity = quantities[productKey] || 0;

            return (
              <ProductCard
                key={product.id}
                product={product}
                selectedVariant={selectedVariantName}
                currentQuantity={currentQuantity}
                onVariantSelect={variantName => handleVariantSelect(productId, variantName)}
                onQuantityChange={delta => updateQuantity(productId, selectedVariantName, delta)}
                onAddToCart={() => handleAddToCart(product)}
              />
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Header & Controls */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-7 w-7 text-gray-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Products</h2>
                <p className="text-sm text-gray-500">
                  {filteredAndSortedProducts.length} of {products.length} products shown
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefetch} disabled={isLoading || isRetrying}>
              <RefreshCw className={cn('h-4 w-4 mr-2', (isLoading || isRetrying) && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search products... (Ctrl+K)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading || !!error}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={clearSearch}
                  disabled={isLoading || !!error}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={isLoading || !!error}
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="name">Sort by Name (A-Z)</option>
              <option value="price">Sort by Price (Low-High)</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {!error && (
        <div className="px-4 md:px-6 py-3 border-b border-gray-200">
          <ScrollArea className="pb-2 -mb-2">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList>
                {availableCategories.map(category => (
                  <TabsTrigger key={category} value={category} disabled={isLoading}>
                    {category}
                    <Badge variant="secondary" className="ml-2 px-1.5 text-xs font-normal">
                      {category === 'All'
                        ? products.length
                        : products.filter(p => p.category?.name === category).length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </ScrollArea>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-hidden">{renderContent()}</div>
    </div>
  );
}
