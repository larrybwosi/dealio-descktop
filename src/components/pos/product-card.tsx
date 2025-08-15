import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  //eslint-disable-next-line
  product: any;
  selectedVariant: string;
  currentQuantity: number;
  onVariantSelect: (variantName: string) => void;
  onQuantityChange: (delta: number) => void;
  onAddToCart: () => void;
}

export function ProductCard({
  product,
  selectedVariant,
  currentQuantity,
  onVariantSelect,
  onQuantityChange,
  onAddToCart,
}: ProductCardProps) {
  const productId = product.id || product.name;
  //eslint-disable-next-line
  const selectedVariantDetails = product.variants?.find((v: any) => v.name === selectedVariant);

  const handleAddToCart = () => {
    if (currentQuantity === 0) {
      onQuantityChange(1);
      setTimeout(onAddToCart, 0);
    } else {
      onAddToCart();
    }
  };

  const handleQuickAdd = () => {
    onQuantityChange(1);
    setTimeout(onAddToCart, 0);
  };

  return (
    <div key={productId} className="border rounded-md overflow-hidden">
      <div className="h-48 w-full overflow-hidden bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
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
              {/* eslint-disable-next-line */}
              {product.variants.map((variant: any) => (
                <Button
                  key={variant.name}
                  variant={selectedVariant === variant.name ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7 px-2 rounded-sm"
                  onClick={() => onVariantSelect(variant.name)}
                >
                  {variant.name}
                </Button>
              ))}
            </div>
            <div className="text-xs text-gray-600 mt-1">Price: {selectedVariantDetails?.price || 'N/A'}</div>
          </div>
        )}

        {product.variants?.length === 1 && (
          <div className="mt-2">
            <Button variant="outline" size="sm" className="text-xs h-7 px-2 rounded-sm" onClick={handleQuickAdd}>
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
              onClick={() => onQuantityChange(-1)}
              disabled={currentQuantity === 0}
            >
              <MinusIcon className="h-3 w-3" />
            </Button>
            <span className="text-sm w-6 text-center">{currentQuantity}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onQuantityChange(1)}>
              <PlusIcon className="h-3 w-3" />
            </Button>
          </div>

          {currentQuantity === 0 ? (
            <Button onClick={handleQuickAdd} className="h-8 text-xs">
              <ShoppingCart className="mr-1 h-3 w-3" />
              Add to cart
            </Button>
          ) : (
            <Button onClick={handleAddToCart} className="h-8 text-xs">
              <ShoppingCart className="mr-1 h-3 w-3" />
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
