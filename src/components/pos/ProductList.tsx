import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Barcode, Search, RefreshCw, MinusIcon, PlusIcon, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CartItem, Product } from '@/types';
import { cn } from '@/lib/utils';
import { useProductState } from '@/store';
import { ProductSkeleton } from '@/components/ui/skeletons/ProductSkeleton';
import { ScrollArea } from '../ui/scroll-area';
import { useListProducts } from '@/lib/api/products';
import useScanDetection from 'use-scan-detection';

interface ProductListProps {
  onAddToCart: (product: CartItem) => void;
}

export function ProductList({ onAddToCart }: ProductListProps) {
  const { selectedCategory, setSelectedCategory } = useProductState();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { data: products = [], isLoading, refetch } = useListProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Barcode scanner integration
  useScanDetection({
    onComplete: code => {
      if (isScanModalOpen) {
        setSearchQuery(code);
        setIsScanModalOpen(false);
      }
    },
    minLength: 6,
  });

  // Search functions
  const normalizeString = (str: string) => {
    if (!str) return '';
    return str
      ?.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const calculateLevenshteinDistance = (a: string, b: string) => {
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
  };

  const getFuzzyMatchScore = (searchTerm: string, targetString: string) => {
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
  };

  // Global keydown handler for search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';

      if (!isTyping && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setSearchQuery(prev => prev + e.key);
      } else if (!isTyping && e.key === 'Backspace') {
        setSearchQuery(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setSearchQuery]);

  const handleRefetch = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refetch products:', error);
    }
  }, [refetch]);

  const getProductKey = (productId: string, variant?: string) => {
    return variant ? `${productId}-${variant}` : productId;
  };

  const handleAddToCart = (product: any, specificVariant?: string) => {
    const productId = product.id || product.name;
    let selectedVariant = specificVariant;
    if (!selectedVariant && product.variants?.length > 0) {
      selectedVariant = selectedVariants[productId] || product.variants[0].name;
    }
    const variantDetails = product.variants?.find(v => v.name === selectedVariant);
    const productKey = getProductKey(productId, selectedVariant);
    const quantity = quantities[productKey] || 1;

    const cartItem: CartItem = {
      id: getProductKey(productId, selectedVariant),
      name: product.name,
      price: variantDetails?.price || product.variants?.[0]?.price || '0',
      quantity: quantity,
      variant: selectedVariant || '',
      image: product.image,
    };

    onAddToCart(cartItem);
    setQuantities({
      ...quantities,
      [productKey]: 0,
    });
  };

  const updateQuantity = (productId: string, variant: string | undefined, delta: number) => {
    const productKey = getProductKey(productId, variant);
    const currentQty = quantities[productKey] || 0;
    const newQty = Math.max(0, currentQty + delta);

    setQuantities({
      ...quantities,
      [productKey]: newQty,
    });
  };

  const handleVariantSelect = (productId: string, variantName: string) => {
    setSelectedVariants({
      ...selectedVariants,
      [productId]: variantName,
    });
  };

  const getSelectedVariant = (product: any) => {
    const productId = product.id || product.name;
    return selectedVariants[productId] || (product.variants?.length > 0 ? product.variants[0].name : '');
  };

  const getCurrentQuantity = (product: any) => {
    const productId = product.id || product.name;
    const selectedVariant = getSelectedVariant(product);
    const productKey = getProductKey(productId, selectedVariant);
    return quantities[productKey] || 0;
  };

  const filteredProducts = products
    .filter(product => {
      if (selectedCategory !== 'All' && product.category?.name !== selectedCategory) {
        return false;
      }
      if (searchQuery === '') return true;

      const nameScore = getFuzzyMatchScore(searchQuery, product.name);
      const barcodeScore = product.barcode ? getFuzzyMatchScore(searchQuery, product.barcode) : 0;
      const categoryScore = product.category?.name ? getFuzzyMatchScore(searchQuery, product.category.name) : 0;
      const variantScores =
        product.variants?.map(variant => {
          const variantNameScore = getFuzzyMatchScore(searchQuery, variant.name);
          const variantPriceScore = getFuzzyMatchScore(searchQuery, variant.price);
          return Math.max(variantNameScore, variantPriceScore);
        }) || [];
      const maxVariantScore = variantScores.length > 0 ? Math.max(...variantScores) : 0;
      const maxScore = Math.max(nameScore, categoryScore, maxVariantScore, barcodeScore);
      return maxScore > 30;
    })
    .sort((a, b) => {
      if (searchQuery === '') return 0;
      const aScore = Math.max(
        getFuzzyMatchScore(searchQuery, a.name),
        a.category?.name ? getFuzzyMatchScore(searchQuery, a.category.name) : 0,
        ...(a.variants?.map(v =>
          Math.max(getFuzzyMatchScore(searchQuery, v.name), getFuzzyMatchScore(searchQuery, v.price))
        ) || [])
      );
      const bScore = Math.max(
        getFuzzyMatchScore(searchQuery, b.name),
        b.category?.name ? getFuzzyMatchScore(searchQuery, b.category.name) : 0,
        ...(b.variants?.map(v =>
          Math.max(getFuzzyMatchScore(searchQuery, v.name), getFuzzyMatchScore(searchQuery, v.price))
        ) || [])
      );
      return bScore - aScore;
    });

  const availableCategories: string[] = ['All', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

  return (
    <div className="bg-white p-4 rounded-lg shadow-xs border flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Lists</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products, variants, or scan a barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 w-[300px] h-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                ×
              </Button>
            )}
          </div>

          <Dialog open={isScanModalOpen} onOpenChange={setIsScanModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Barcode className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-center">Scan Product Barcode</DialogTitle>
                <DialogDescription className="text-center pt-4">
                  <Barcode className="h-20 w-20 mx-auto mb-4 text-primary" />
                  Point the scanner at a barcode. The modal will close automatically upon successful scan.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleRefetch} disabled={isLoading} className="h-9">
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedCategory} className="mb-6">
        <TabsList className="flex overflow-x-auto space-x-1 pb-1">
          {availableCategories.map(category => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm',
                selectedCategory === category ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
              )}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <ScrollArea className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const productId = product.id || product.name;
              const selectedVariant = getSelectedVariant(product);
              const selectedVariantDetails = product.variants?.find(v => v.name === selectedVariant);
              const currentQuantity = getCurrentQuantity(product);

              return (
                <div key={productId} className="border rounded-md overflow-hidden">
                  <div className="h-48 w-full overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{product.name}</h3>
                      {product.category && (
                        <span
                          className="text-xs px-2 py-1 rounded-full text-gray-100"
                          style={{
                            backgroundColor: product.category.color || '#e2e8f0',
                          }}
                        >
                          {product.category.name}
                        </span>
                      )}
                    </div>

                    {selectedVariantDetails && (
                      <div className="text-sm text-gray-700 mt-1 font-medium">{selectedVariantDetails.price}</div>
                    )}

                    {product.variants?.length > 1 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-600 mb-2">Select variant:</div>
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map(variant => (
                            <Button
                              key={variant.name}
                              variant={selectedVariant === variant.name ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs h-7 px-2 rounded-sm"
                              onClick={() => handleVariantSelect(productId, variant.name)}
                            >
                              {variant.name}
                            </Button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Price: {selectedVariantDetails?.price || 'N/A'}
                        </div>
                      </div>
                    )}

                    {product.variants?.length === 1 && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2 rounded-sm"
                          onClick={() => handleAddToCart(product, product.variants[0].name)}
                        >
                          Add {product.variants[0].name} ({product.variants[0].price})
                        </Button>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(productId, selectedVariant, -1)}
                        >
                          <MinusIcon className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{currentQuantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(productId, selectedVariant, 1)}
                        >
                          <PlusIcon className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="h-8 text-xs"
                        disabled={currentQuantity === 0}
                      >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        Add to cart
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
