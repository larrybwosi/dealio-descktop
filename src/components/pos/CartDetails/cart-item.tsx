// components/cart/cart-item.tsx
import { memo } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessType, getBusinessConfig } from '@/types/business-config';
import { CartItem } from '@/types';
import { useFormattedCurrency } from '@/lib/utils';

interface CartItemProps {
  item: CartItem;
  businessConfig: ReturnType<typeof getBusinessConfig>;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CartItemComponent = memo(
  ({ item, businessConfig, onUpdateQuantity, onRemoveItem }: CartItemProps) => {
    const formatCurrency = useFormattedCurrency();

    return (
      <div className="flex gap-4 items-center transition-colors hover:bg-gray-50 p-2 rounded-lg">
        <img
          src={item.image}
          alt={item.name}
          className="h-16 w-16 rounded-md object-cover shrink-0"
          onError={e => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Item';
          }}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm">{item.name}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-500"
              onClick={() => onRemoveItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  },
  // Compare only the necessary props to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Always re-render if the item reference changes
    if (prevProps.item !== nextProps.item) return false;
    
    // Re-render if any of these critical properties change
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.quantity === nextProps.item.quantity &&
      prevProps.item.price === nextProps.item.price
    );
  }
);

CartItemComponent.displayName = 'CartItemComponent';
