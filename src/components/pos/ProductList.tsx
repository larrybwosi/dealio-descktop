import { useState, useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  RefreshCw,
} from 'lucide-react';
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

// Matches the payload from the Rust backend
interface ScanPayload {
  message: string;
}

export function ProductList({ onAddToCart }: ProductListProps) {
  const { selectedCategory, setSelectedCategory } = useProductState();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { data: products = [], isLoading, error, refetch } = useListProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);


  // The handleAddToCart function is now wrapped in useCallback to stabilize its reference
  const handleAddToCart = useCallback(
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    (product: any, specificVariant?: string) => {
      // console.log('Adding product to cart:', product, 'with variant:', specificVariant);
      const productId = product.id || product.name;
      let selectedVariant = specificVariant;
      if (!selectedVariant && product.variants?.length > 0) {
        selectedVariant = selectedVariants[productId] || product.variants[0].name;
      }
      const variantDetails = product.variants?.find(v => v.name === selectedVariant);
      if (!variantDetails) {
        toast.error(`No variant found for product ${productId} with variant ${selectedVariant}`);
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
    },
    [quantities, selectedVariants, onAddToCart]
  );

  useEffect(() => {
    if (products.length === 0) return; // Don't listen until products are loaded

    let unlisten: (() => void) | undefined;

    const setupScannerListener = async () => {
      // Listen for the 'scanner-data' event from Rust
      const unsubscribe = await listen<ScanPayload>('scanner-data', event => {
        const barcode = event.payload.message.trim();
        if (!barcode) return;

        console.log(`[Frontend] Barcode scanned: ${barcode}`);

        // Find the product that matches the scanned barcode
        const product = products.find(p => p.barcode === barcode);

        if (product) {
          console.log(`Product found: ${product.name}. Adding to cart.`);
          handleAddToCart(product);
          toast.success(`'${product.name}' added to cart.`);
        } else {
          console.warn(`No product found for barcode: ${barcode}`);
          toast.error(`Product with barcode '${barcode}' not found.`);
        }
      });

      unlisten = unsubscribe;
    };

    setupScannerListener();

    // Cleanup function: remove the listener when the component unmounts
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [products, handleAddToCart]); // Rerun if products or the handler function changes

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
      setIsRetrying(true);
      await refetch();
    } catch (error) {
      console.error('Failed to refetch products:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [refetch]);

  const getProductKey = (productId: string, variant?: string) => {
    return variant ? `${productId}-${variant}` : productId;
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

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSelectedVariant = (product: any) => {
    const productId = product.id || product.name;
    return selectedVariants[productId] || (product.variants?.length > 0 ? product.variants[0].name : '');
  };

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCurrentQuantity = (product: any) => {
    const productId = product.id || product.name;
    const selectedVariant = getSelectedVariant(product);
    const productKey = getProductKey(productId, selectedVariant);
    return quantities[productKey] || 0;
  };

  const filteredProducts = products
    ?.filter(product => {
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

  const availableCategories: string[] = ['All', ...new Set(products.map(p => p.category?.name)?.filter(Boolean))];

  return (
    <div className="bg-white p-4 rounded-lg shadow-xs border flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Lists</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products or scan a barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 w-[300px] h-9"
              disabled={isLoading || !!error}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
                disabled={isLoading || !!error}
              >
                ×
              </Button>
            )}
          </div>

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

      {/* Only show tabs if not in error state */}
      {!error && (
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
                disabled={isLoading}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Content area with scrollable products */}
      {error ? (
        <ProductListError error={error} onRetry={handleRefetch} isRetrying={isRetrying} />
        // <></>
      ) : isLoading ? (
        <ProductSkeleton />
      ) : (
        <ScrollArea className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            {filteredProducts?.map(product => {
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
  );
}
