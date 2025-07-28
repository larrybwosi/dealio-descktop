import { useState } from 'react';
import { categories } from '@/data/products';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, MinusIcon, PlusIcon, ShoppingCart } from 'lucide-react';
import { CartItem, Product } from '@/types';
import { cn } from '@/lib/utils';
import { useProductState } from '@/store';
import { ProductSkeleton } from '@/components/ui/skeletons/ProductSkeleton';
import { ScrollArea } from '../ui/scroll-area';
import { useListProducts } from '@/lib/api/products';

interface ProductListProps {
  onAddToCart: (product: CartItem) => void;
}

export function ProductList({ onAddToCart }: ProductListProps) {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useProductState();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { data: products = [], isLoading } = useListProducts();

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableCategories: string[] = ['All', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

  return (
    <div className="bg-white p-4 rounded-lg shadow-xs border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Lists</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px] h-9"
            />
          </div>
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
        <ScrollArea className="h-[600px] w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
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
