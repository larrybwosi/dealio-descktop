import { memo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BusinessType, getBusinessConfig } from '@/types/business-config';
import { useFormattedCurrency } from '@/lib/utils';

interface CartSummaryProps {
  summary: { subtotal: number; discount: number; tax: number; total: number };
  businessConfig: ReturnType<typeof getBusinessConfig>;
  onProceed: () => void;
  isCartEmpty: boolean;
  discountValue: number;
  onDiscountValueChange: (value: number) => void;
}

export const CartSummaryComponent = memo(
  ({
    summary,
    businessConfig,
    onProceed,
    isCartEmpty,
    discountValue,
    onDiscountValueChange,
  }: CartSummaryProps) => {
    const [promoCode, setPromoCode] = useState('');
    const formatCurrency = useFormattedCurrency();

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // If empty or invalid, set to 0
      if (newValue === '' || isNaN(parseFloat(newValue))) {
        onDiscountValueChange(0);
        return;
      }

      // Parse the value and ensure it's within bounds
      const numValue = Math.max(0, Math.min(parseFloat(newValue), summary.subtotal));
      console.log('Parsed discount value:', numValue);
      onDiscountValueChange(numValue);
    };

    const handleDiscountBlur = () => {
      // When the input loses focus, ensure we show a valid number
      const validValue = Math.max(0, Math.min(discountValue, summary.subtotal));
      onDiscountValueChange(validValue);
    };

    return (
      <div className="border-t bg-gray-50/50 p-4 space-y-3">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Discount</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                </span>
                <Input
                  type="number"
                  min="0"
                  max={summary.subtotal}
                  step="0.01"
                  className="w-24 h-7 text-xs pl-6"
                  value={discountValue}
                  onChange={handleDiscountChange}
                  onBlur={handleDiscountBlur}
                />
              </div>
            </div>
            <span className="font-medium text-green-600">- {formatCurrency(summary.discount)}</span>
          </div>
          <div className="flex justify-between">
            <span>{businessConfig.taxLabel || 'Tax'} (incl.)</span>
            <span className="font-medium">{formatCurrency(summary.tax)}</span>
          </div>
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatCurrency(summary.total)}</span>
        </div>
        <div className="pt-2">
          <div className="relative mb-3">
            <Input placeholder="Enter promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
            <Button variant="secondary" className="absolute right-1 top-1 h-8 text-xs" disabled={!promoCode}>
              Apply
            </Button>
          </div>
          <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={onProceed} disabled={isCartEmpty}>
            <CreditCard className="mr-2 h-4 w-4" />
            {businessConfig.paymentButtonText}
          </Button>
        </div>
      </div>
    );
  }
);

CartSummaryComponent.displayName = 'CartSummaryComponent';
