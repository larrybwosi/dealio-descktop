import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, X, Package } from 'lucide-react';
import { CartItem, Product } from '@/types';
import { cn } from '@/lib/utils';
import { useProductState } from '@/store';
import { ProductSkeleton } from '@/components/ui/skeletons/ProductSkeleton';
import { ScrollArea } from '../ui/scroll-area';
import { useListProducts } from '@/lib/services/products';
import { ProductCard } from './product-card';
import { ProductListError } from './product-list-error';

interface ProductListProps {
  onAddToCart: (product: CartItem) => void;
}

interface ScanPayload {
  message: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price' | 'category' | 'relevance';

export function ProductList({ onAddToCart }: ProductListProps) {
  const { selectedCategory, setSelectedCategory } = useProductState();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { data: products = [], isLoading, error, refetch } = useListProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search to improve performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Enhanced handleAddToCart function with better error handling
  const handleAddToCart = useCallback(
    // eslint-disable-next-line
    (product: any, specificVariant?: string) => {
      try {
        const productId = product.id || product.name;
        let selectedVariant = specificVariant;

        if (!selectedVariant && product.variants?.length > 0) {
          selectedVariant = selectedVariants[productId] || product.variants[0].name;
        }

        const variantDetails = product.variants?.find(v => v.name === selectedVariant);

        if (!variantDetails) {
          toast.error(`Variant not available for ${product.name}`);
          return;
        }

        const productKey = getProductKey(productId, selectedVariant);
        const quantity = quantities[productKey] || 1;

        const cartItem: CartItem = {
          id: getProductKey(productId, selectedVariant),
          name: product.name,
          price: variantDetails?.price || product.variants?.[0]?.price || '0',
          quantity: quantity,
          productId: productId,
          variant: selectedVariant || '',
          image: product.image,
          variantId: variantDetails?.id || '',
          sellingUnitId: variantDetails.sellingUnits[0].id || '',
        };

        onAddToCart(cartItem);
        setQuantities(prev => ({ ...prev, [productKey]: 0 }));

      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add item to cart');
      }
    },
    [quantities, selectedVariants, onAddToCart]
  );

  // Barcode scanner listener
  useEffect(() => {
    if (products.length === 0) return;

    let unlisten: (() => void) | undefined;

    const setupScannerListener = async () => {
      const unsubscribe = await listen<ScanPayload>('scanner-data', event => {
        const barcode = event.payload.message.trim();
        if (!barcode) return;

        const product = products.find(p => p.barcode === barcode);

        if (product) {
          handleAddToCart(product);
        } else {
          toast.error(`Product not found`, {
            description: `Barcode: ${barcode}`,
          });
        }
      });

      unlisten = unsubscribe;
    };

    setupScannerListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [products, handleAddToCart]);

  // Enhanced search with better fuzzy matching
  const normalizeString = useCallback((str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const calculateLevenshteinDistance = useCallback((a: string, b: string) => {
    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
      }
    }

    return matrix[b.length][a.length];
  }, []);

  const getFuzzyMatchScore = useCallback(
    (searchTerm: string, targetString: string) => {
      const normalizedSearch = normalizeString(searchTerm);
      const normalizedTarget = normalizeString(targetString);

      if (normalizedTarget.includes(normalizedSearch)) return 100;

      const words = normalizedSearch.split(' ');
      let matchCount = 0;

      for (const word of words) {
        if (normalizedTarget.includes(word)) {
          matchCount++;
        } else {
          const targetWords = normalizedTarget.split(' ');
          for (const targetWord of targetWords) {
            const distance = calculateLevenshteinDistance(word, targetWord);
            const similarity = 1 - distance / Math.max(word.length, targetWord.length);
            if (similarity > 0.7) {
              matchCount += similarity;
              break;
            }
          }
        }
      }

      return (matchCount / words.length) * 100;
    },
    [normalizeString, calculateLevenshteinDistance]
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';

      if (!isTyping && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        searchInputRef.current?.focus();
      } else if (!isTyping && e.key === 'Backspace') {
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleRefetch = useCallback(async () => {
    try {
      setIsRetrying(true);
      await refetch();
      toast.success('Products refreshed');
    } catch (error) {
      console.error('Failed to refetch products:', error);
      toast.error('Failed to refresh products');
    } finally {
      setIsRetrying(false);
    }
  }, [refetch]);

  const getProductKey = useCallback((productId: string, variant?: string) => {
    return variant ? `${productId}-${variant}` : productId;
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variant: string | undefined, delta: number) => {
      const productKey = getProductKey(productId, variant);
      setQuantities(prev => {
        const currentQty = prev[productKey] || 0;
        const newQty = Math.max(0, currentQty + delta);
        return { ...prev, [productKey]: newQty };
      });
    },
    [getProductKey]
  );

  const handleVariantSelect = useCallback((productId: string, variantName: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantName,
    }));
  }, []);

  const getSelectedVariant = useCallback(
    // eslint-disable-next-line
    (product: any) => {
      const productId = product.id || product.name;
      return selectedVariants[productId] || (product.variants?.length > 0 ? product.variants[0].name : '');
    },
    [selectedVariants]
  );

  const getCurrentQuantity = useCallback(
    // eslint-disable-next-line
    (product: any) => {
      const productId = product.id || product.name;
      const selectedVariant = getSelectedVariant(product);
      const productKey = getProductKey(productId, selectedVariant);
      return quantities[productKey] || 0;
    },
    [quantities, getSelectedVariant, getProductKey]
  );

  // Memoized filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered =
      products?.filter(product => {
        if (selectedCategory !== 'All' && product.category?.name !== selectedCategory) {
          return false;
        }

        if (debouncedSearchQuery === '') return true;

        const nameScore = getFuzzyMatchScore(debouncedSearchQuery, product.name);
        const barcodeScore = product.barcode ? getFuzzyMatchScore(debouncedSearchQuery, product.barcode) : 0;
        const categoryScore = product.category?.name
          ? getFuzzyMatchScore(debouncedSearchQuery, product.category.name)
          : 0;
        const variantScores =
          product.variants?.map(variant => {
            const variantNameScore = getFuzzyMatchScore(debouncedSearchQuery, variant.name);
            const variantPriceScore = getFuzzyMatchScore(debouncedSearchQuery, variant.price);
            return Math.max(variantNameScore, variantPriceScore);
          }) || [];

        const maxVariantScore = variantScores.length > 0 ? Math.max(...variantScores) : 0;
        const maxScore = Math.max(nameScore, categoryScore, maxVariantScore, barcodeScore);

        return maxScore > 30;
      }) || [];

    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price': {
          const aPrice = parseFloat(a.variants?.[0]?.price || '0');
          const bPrice = parseFloat(b.variants?.[0]?.price || '0');
          return aPrice - bPrice;
        }
        case 'category':
          return (a.category?.name || '').localeCompare(b.category?.name || '');
        case 'relevance':
        default: {
          if (debouncedSearchQuery === '') return a.name.localeCompare(b.name);
          interface Variant {
            name: string;
            price: string;
          }

          interface ProductWithVariants {
            name: string;
            category?: {
              name: string;
            };
            variants?: Variant[];
          }

          const aScore: number = Math.max(
            getFuzzyMatchScore(debouncedSearchQuery, a.name),
            a.category?.name ? getFuzzyMatchScore(debouncedSearchQuery, a.category.name) : 0,
            ...(a.variants?.map((v: Variant): number =>
              Math.max(
                getFuzzyMatchScore(debouncedSearchQuery, v.name),
                getFuzzyMatchScore(debouncedSearchQuery, v.price)
              )
            ) || [])
          );
          const bScore = Math.max(
            getFuzzyMatchScore(debouncedSearchQuery, b.name),
            b.category?.name ? getFuzzyMatchScore(debouncedSearchQuery, b.category.name) : 0,
            ...(b.variants?.map(v =>
              Math.max(
                getFuzzyMatchScore(debouncedSearchQuery, v.name),
                getFuzzyMatchScore(debouncedSearchQuery, v.price)
              )
            ) || [])
          );
          return bScore - aScore;
        }
      }
    });
  }, [products, selectedCategory, debouncedSearchQuery, sortBy, getFuzzyMatchScore]);

  const availableCategories: string[] = useMemo(
    () => ['All', ...new Set(products.map(p => p.category?.name)?.filter(Boolean))],
    [products]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col gap-4">
          {/* Title and Actions Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-gray-600" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredAndSortedProducts.length} of {products.length} products
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefetch}
                disabled={isLoading || isRetrying}
                className="h-9"
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', (isLoading || isRetrying) && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search products... (Ctrl+K)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading || !!error}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={clearSearch}
                  disabled={isLoading || !!error}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !!error}
            >
              <option value="relevance">Relevance</option>
              <option value="name">Name A-Z</option>
              <option value="price">Price Low-High</option>
              <option value="category">Category</option>
            </select>

            {debouncedSearchQuery && (
              <Badge variant="secondary" className="text-xs">
                {filteredAndSortedProducts.length} results
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {!error && (
        <div className="px-6 py-4 border-b border-gray-100">
          <Tabs value={selectedCategory} className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-gray-100 p-1 min-w-max">
                {availableCategories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                      'disabled:pointer-events-none disabled:opacity-50',
                      selectedCategory === category
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                    disabled={isLoading}
                  >
                    {category}
                    {category !== 'All' && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {products.filter(p => p.category?.name === category).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-6">
        {error ? (
          <ProductListError error={error} onRetry={handleRefetch} isRetrying={isRetrying} />
        ) : isLoading ? (
          <ProductSkeleton />
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {debouncedSearchQuery
                ? `No products match "${debouncedSearchQuery}"`
                : 'No products available in this category'}
            </p>
            {debouncedSearchQuery && (
              <Button variant="outline" onClick={clearSearch}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className={cn('gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
              {filteredAndSortedProducts.map(product => {
                const productId = product.id || product.name;
                const selectedVariant = getSelectedVariant(product);
                const currentQuantity = getCurrentQuantity(product);

                return (
                  <ProductCard
                    key={productId}
                    product={product}
                    selectedVariant={selectedVariant}
                    currentQuantity={currentQuantity}
                    onVariantSelect={variantName => handleVariantSelect(productId, variantName)}
                    onQuantityChange={delta => updateQuantity(productId, selectedVariant, delta)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
