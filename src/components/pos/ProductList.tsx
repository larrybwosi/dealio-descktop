import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { listen } from '@tauri-apps/api/event';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductCard } from './product-card';
import { ProductListError } from './product-list-error';
import { ProductSkeleton } from '@/components/ui/skeletons/ProductSkeleton';

import { Search, RefreshCw, X, Package } from 'lucide-react';

// Types & Utilities
import { CartItem, Product } from '@/types';
import { cn } from '@/lib/utils';
import { useProductState } from '@/store';
import { useListProducts } from '@/lib/services/products';
import { getFuzzyMatchScore } from '@/utils/search';

// --- TYPE DEFINITIONS ---
interface ProductListProps {
  onAddToCart: (product: CartItem) => void;
}

interface ScanPayload {
  message: string;
}

type SortOption = 'relevance' | 'name' | 'price' | 'category';

const getProductKey = (productId: string, variantName?: string): string => {
  return variantName ? `${productId}-${variantName}` : productId;
};

// Memoized ProductCard wrapper to prevent unnecessary re-renders
const MemoizedProductCard = memo(
  ({
    product,
    selectedVariant,
    currentQuantity,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
  }: {
    product: Product;
    selectedVariant: string | undefined;
    currentQuantity: number;
    onVariantSelect: (variantName: string) => void;
    onQuantityChange: (delta: number) => void;
    onAddToCart: () => void;
  }) => (
    <ProductCard
      product={product}
      selectedVariant={selectedVariant}
      currentQuantity={currentQuantity}
      onVariantSelect={onVariantSelect}
      onQuantityChange={onQuantityChange}
      onAddToCart={onAddToCart}
    />
  )
);

MemoizedProductCard.displayName = 'MemoizedProductCard';

// Virtual scrolling hook for better performance with large lists
// eslint-disable-next-line
const useVirtualScrolling = (items: any[], containerHeight: number, itemHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightState, setContainerHeightState] = useState(containerHeight);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerHeightState / itemHeight) + 5, // +5 for buffer
    items.length - 1
  );

  const visibleItems = items.slice(
    Math.max(0, visibleStartIndex - 2), // -2 for buffer
    visibleEndIndex + 3 // +3 for buffer
  );

  return {
    visibleStartIndex: Math.max(0, visibleStartIndex - 2),
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY: Math.max(0, visibleStartIndex - 2) * itemHeight,
    setScrollTop,
    setContainerHeight: setContainerHeightState,
  };
};

export function ProductList({ onAddToCart }: ProductListProps) {
  const { data: products = [], isLoading, error, refetch } = useListProducts();
  const { selectedCategory, setSelectedCategory } = useProductState();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isRetrying, setIsRetrying] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchWorkerRef = useRef<Worker | null>(null);

  // Memoize categories calculation to prevent recalculation on every render
  const availableCategories: string[] = useMemo(
    () => ['All', ...new Set(products.map(p => p.category?.name).filter(Boolean) as string[])],
    [products]
  );

  // Optimize filtering and sorting with better memoization
  const filteredAndSortedProducts = useMemo(() => {
    if (products.length === 0) return [];

    // Use RAF for heavy computations to prevent blocking
    const performFiltering = () => {
      // Step 1: Filter by category (optimized with early return)
      const categoryFiltered =
        selectedCategory === 'All' ? products : products.filter(p => p.category?.name === selectedCategory);

      if (categoryFiltered.length === 0) return [];

      // Step 2: Search scoring (optimized with batch processing)
      let scoredProducts;
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();

        scoredProducts = categoryFiltered
          .map(product => {
            // Optimized scoring with early exit conditions
            let maxScore = 0;

            // Quick name check first (most common match)
            const nameScore = getFuzzyMatchScore(query, product.name.toLowerCase());
            if (nameScore > maxScore) maxScore = nameScore;

            // Only check other fields if we haven't found a good match
            if (maxScore < 80) {
              if (product.barcode) {
                const barcodeScore = getFuzzyMatchScore(query, product.barcode.toLowerCase());
                if (barcodeScore > maxScore) maxScore = barcodeScore;
              }

              if (maxScore < 80 && product.category?.name) {
                const categoryScore = getFuzzyMatchScore(query, product.category.name.toLowerCase());
                if (categoryScore > maxScore) maxScore = categoryScore;
              }

              if (maxScore < 80 && product.variants?.length) {
                for (const variant of product.variants) {
                  const variantScore = getFuzzyMatchScore(query, variant.name.toLowerCase());
                  if (variantScore > maxScore) {
                    maxScore = variantScore;
                    if (maxScore >= 80) break; // Early exit if good match found
                  }
                }
              }
            }

            return { product, score: maxScore };
          })
          .filter(item => item.score > 30);
      } else {
        scoredProducts = categoryFiltered.map(product => ({ product, score: 0 }));
      }

      // Step 3: Optimized sorting
      if (scoredProducts.length <= 1) return scoredProducts.map(item => item.product);

      return scoredProducts
        .sort((a, b) => {
          switch (sortBy) {
            case 'relevance':
              return b.score - a.score;
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
        })
        .map(item => item.product);
    };

    return performFiltering();
  }, [products, selectedCategory, debouncedSearchQuery, sortBy]);

  // Virtual scrolling for better performance with large lists
  const itemHeight = 280; // Approximate height of ProductCard
  const containerHeight = 600; // Approximate container height
  const { visibleStartIndex, visibleItems, totalHeight, offsetY, setScrollTop, setContainerHeight } =
    useVirtualScrolling(filteredAndSortedProducts, containerHeight, itemHeight);

  // --- OPTIMIZED CALLBACKS & EVENT HANDLERS ---

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  // Memoize handlers to prevent child re-renders
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

  // Optimized quantity update with batching
  const updateQuantity = useCallback((productId: string, variantName: string | undefined, delta: number) => {
    const productKey = getProductKey(productId, variantName);
    setQuantities(prev => {
      const currentQty = prev[productKey] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return { ...prev, [productKey]: newQty };
    });
  }, []);

  const handleVariantSelect = useCallback((productId: string, variantName: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantName }));
  }, []);

  // Memoized handlers for ProductCard to prevent re-renders
  const createVariantSelectHandler = useCallback(
    (productId: string) => {
      return (variantName: string) => handleVariantSelect(productId, variantName);
    },
    [handleVariantSelect]
  );

  const createQuantityChangeHandler = useCallback(
    (productId: string, variantName: string | undefined) => {
      return (delta: number) => updateQuantity(productId, variantName, delta);
    },
    [updateQuantity]
  );

  const createAddToCartHandler = useCallback(
    (product: Product) => {
      return () => handleAddToCart(product);
    },
    [handleAddToCart]
  );

  // Throttled scroll handler for virtual scrolling
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);
    },
    [setScrollTop]
  );

  // --- EFFECTS ---

  // Optimized debounce with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Barcode scanner listener (optimized with cleanup)
  useEffect(() => {
    if (products.length === 0) return;

    const setupListener = async () => {
      return await listen<ScanPayload>('scanner-data', event => {
        const barcode = event.payload.message?.trim();
        if (!barcode) return;

        // Use requestIdleCallback for non-critical search
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            const foundProduct = products.find(p => p.barcode === barcode);
            if (foundProduct) {
              handleAddToCart(foundProduct);
            } else {
              toast.error('Product not found', { description: `Barcode: ${barcode}` });
            }
          });
        } else {
          const foundProduct = products.find(p => p.barcode === barcode);
          if (foundProduct) {
            handleAddToCart(foundProduct);
          } else {
            toast.error('Product not found', { description: `Barcode: ${barcode}` });
          }
        }
      });
    };

    const unlistenPromise = setupListener();
    return () => {
      unlistenPromise.then(unlistenFn => unlistenFn());
    };
  }, [products, handleAddToCart]);

  // Keyboard shortcuts (optimized)
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

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Container height observer for virtual scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [setContainerHeight]);

  // --- RENDER LOGIC ---

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

    // Virtual scrolling implementation for smooth performance
    const useVirtualization = filteredAndSortedProducts.length > 50; // Only virtualize for large lists

    if (useVirtualization) {
      return (
        <div
          ref={scrollContainerRef}
          className="h-full overflow-auto will-change-scroll"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth' }}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                willChange: 'transform',
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {visibleItems.map((product, index) => {
                const actualIndex = visibleStartIndex + index;
                const productId = product.id;
                const selectedVariantName = selectedVariants[productId] || product.variants?.[0]?.name;
                const productKey = getProductKey(productId, selectedVariantName);
                const currentQuantity = quantities[productKey] || 0;

                return (
                  <MemoizedProductCard
                    key={`${product.id}-${actualIndex}`}
                    product={product}
                    selectedVariant={selectedVariantName}
                    currentQuantity={currentQuantity}
                    onVariantSelect={createVariantSelectHandler(productId)}
                    onQuantityChange={createQuantityChangeHandler(productId, selectedVariantName)}
                    onAddToCart={createAddToCartHandler(product)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Regular rendering for smaller lists
    return (
      <ScrollArea className="h-full pr-4 -mr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedProducts.map(product => {
            const productId = product.id;
            const selectedVariantName = selectedVariants[productId] || product.variants?.[0]?.name;
            const productKey = getProductKey(productId, selectedVariantName);
            const currentQuantity = quantities[productKey] || 0;

            return (
              <MemoizedProductCard
                key={product.id}
                product={product}
                selectedVariant={selectedVariantName}
                currentQuantity={currentQuantity}
                onVariantSelect={createVariantSelectHandler(productId)}
                onQuantityChange={createQuantityChangeHandler(productId, selectedVariantName)}
                onAddToCart={createAddToCartHandler(product)}
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
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
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
          <Button variant="outline" size="sm" onClick={handleRefetch} disabled={isLoading || isRetrying}>
            <RefreshCw className={cn('h-4 w-4 mr-2', (isLoading || isRetrying) && 'animate-spin')} />
            Refresh
          </Button>
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
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
}
