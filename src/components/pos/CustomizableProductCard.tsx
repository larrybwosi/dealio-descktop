import { useState, useMemo, useCallback } from 'react';
import { Product, ProductVariant } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MinusIcon, PlusIcon, ShoppingCart, Info, BookOpen, Pill } from 'lucide-react';
import { useBusinessConfig } from '@/lib/business-config-manager';

interface CustomizableProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export function CustomizableProductCard({ product, onAddToCart }: CustomizableProductCardProps) {
  const { config, businessType } = useBusinessConfig();

  // State for selected variant and quantity
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(product.variants[0]?.id || null);
  const [quantity, setQuantity] = useState<number>(1);

  // Memoized values to avoid recalculations on every render
  const selectedVariant = useMemo(
    () => product.variants.find(v => v.id === selectedVariantId),
    [product.variants, selectedVariantId]
  );

  const isOutOfStock = useMemo(() => selectedVariant?.stock === 0, [selectedVariant]);

  // Event Handlers using useCallback for performance
  const handleQuantityChange = useCallback(
    (delta: number) => {
      setQuantity(prev => {
        const newQuantity = prev + delta;
        if (newQuantity < 1) return 1;
        // Optional: Check against stock
        if (selectedVariant && newQuantity > selectedVariant.stock) {
          return selectedVariant.stock;
        }
        return newQuantity;
      });
    },
    [selectedVariant]
  );

  const handleAddToCartClick = useCallback(() => {
    if (selectedVariant && quantity > 0 && !isOutOfStock) {
      onAddToCart(product, selectedVariant, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  }, [product, selectedVariant, quantity, onAddToCart, isOutOfStock]);

  const handleVariantSelect = useCallback((variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1); // Reset quantity when variant changes
  }, []);

  // --- Render Functions for different business types ---

  const renderBusinessSpecificDetails = () => {
    switch (businessType) {
      case 'bookshop':
        return (
          product.author && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <BookOpen className="h-3 w-3 mr-1.5" />
              <span>{product.author}</span>
            </div>
          )
        );
      case 'pharmacy':
        return (
          product.dosage && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Pill className="h-3 w-3 mr-1.5" />
              <span>Dosage: {product.dosage}</span>
            </div>
          )
        );
      case 'restaurant':
        return (
          product.calories && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Info className="h-3 w-3 mr-1.5" />
              <span>{product.calories} kcal</span>
            </div>
          )
        );
      default:
        return null;
    }
  };

  const renderStockInfo = () => {
    if (!config.productCard?.showStock || !selectedVariant) return null;
    if (isOutOfStock) {
      return <Badge variant="destructive">{config.productCard?.outOfStockText || 'Out of Stock'}</Badge>;
    }
    if (selectedVariant.stock < 10) {
      // Low stock warning
      return <Badge variant="secondary">Only {selectedVariant.stock} left!</Badge>;
    }
    return null;
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm flex flex-col justify-between bg-white">
      {/* --- Image and Badges --- */}
      <div className="relative">
        <div className="h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={product.image || `https://placehold.co/400x300/e2e8f0/64748b?text=${product.name}`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {product.isPopular && <Badge>Popular</Badge>}
          {product.requiresPrescription && (
            <Badge variant="destructive">{config.productCard?.prescriptionRequiredText || 'Rx'}</Badge>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {/* --- Product Info --- */}
        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
        {renderBusinessSpecificDetails()}
        <p className="text-xl font-bold text-gray-800 mt-2">${selectedVariant?.price.toFixed(2) || 'N/A'}</p>
        <div className="mt-2 h-6">{renderStockInfo()}</div>

        {/* --- Variants --- */}
        {product.variants.length > 1 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Variant:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.variants.map(variant => (
                <Button
                  key={variant.id}
                  variant={selectedVariantId === variant.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVariantSelect(variant.id)}
                  disabled={variant.stock === 0}
                  className={`text-xs ${variant.stock === 0 ? 'line-through' : ''}`}
                >
                  {variant.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-grow" />

        {/* --- Actions --- */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleQuantityChange(-1)}
              disabled={isOutOfStock}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <span className="text-lg w-10 text-center font-semibold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleQuantityChange(1)}
              disabled={isOutOfStock}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleAddToCartClick}
            className="flex-1"
            disabled={isOutOfStock || product.requiresPrescription} // Example: Disable if Rx needed
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {config.productCard?.actionButtonText || 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
