import { useState } from 'react';
import { categories } from '@/data/products';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, MinusIcon, PlusIcon, ShoppingCart } from 'lucide-react';
import { CartItem, Product } from '@/types';
import { cn } from '@/lib/utils';
import { useProductState, useCurrencyState } from '@/store';
import { ProductSkeleton } from '@/components/ui/skeletons/ProductSkeleton';
import { useProductsByCategory } from '@/hooks/use-query-hooks';
import { ScrollArea } from '../ui/scroll-area';

interface ProductListProps {
  onAddToCart: (product: CartItem) => void;
}

export function ProductList({ onAddToCart }: ProductListProps) {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useProductState();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: products = [], isLoading } = useProductsByCategory(selectedCategory);

  const handleAddToCart = (product: Product, variant: string = '', addition: string = '') => {
    const selectedVariant = variant || 
      (product.variants?.find(v => v.default)?.name || 
      (product.variants && product.variants.length > 0 ? product.variants[0].name : ''));
    
    const selectedAddition = addition || 
      (product.additions?.find(a => a.default)?.name || 
      (product.additions && product.additions.length > 0 ? product.additions[0].name : ''));

    const quantity = quantities[product.id] || 1;

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      variant: selectedVariant !== '-' ? selectedVariant : undefined,
      addition: selectedAddition !== '-' ? selectedAddition : undefined,
      image: product.image
    };

    onAddToCart(cartItem);
    
    // Reset quantity after adding to cart
    setQuantities({
      ...quantities,
      [product.id]: 0
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const currentQty = quantities[productId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    setQuantities({
      ...quantities,
      [productId]: newQty
    });
  };

  // Filter products by search query
  const filteredProducts = products.filter(product => {
    return searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <ScrollArea className="bg-white p-4 rounded-lg shadow-xs border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Lists</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search for food"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px] h-9"
            />
          </div>
          <Button variant="outline" className="h-9">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Input manually</span>
          </Button>
        </div>
      </div>

      {/* Categories tabs */}
      <Tabs value={selectedCategory} className="mb-6">
        <TabsList className="flex overflow-x-auto space-x-1 pb-1">
          {["All", ...categories.filter((c) => c !== "All")].map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground"
              )}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Products grid with loading state */}
      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border rounded-md overflow-hidden">
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for missing images
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x300/e2e8f0/64748b?text=Food+Image";
                  }}
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium">{product.name}</h3>
                <div className="text-sm text-gray-700 mt-1">
                  {product.price}/serving
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {product.variants?.map((variant) => (
                    <Button
                      key={variant.name}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2 rounded-sm"
                      onClick={() => handleAddToCart(product, variant.name)}
                    >
                      {variant.name}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(product.id, -1)}
                    >
                      <MinusIcon className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">
                      {quantities[product.id] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="h-8 text-xs"
                    disabled={(quantities[product.id] || 0) === 0}
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    Add to cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}