import { memo, useCallback, useMemo, useState } from 'react';
import { Eye, ChevronDown, ChevronUp, Minus, Plus, Trash2, CreditCard, User, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CartItem, OrderType, Customer } from '@/types';
import { BusinessType, getBusinessConfig, requiresLocationForOrderType } from '@/types/business-config';
import { useFormattedCurrency } from '@/lib/utils';
import { useOrgStore } from '@/lib/tanstack-axios';

interface CartDetailsProps {
  businessType: BusinessType;
  cartItems: CartItem[];
  updateQuantity: (id: string, newQuantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  onProceedPayment: () => void;
  onOpenCustomer: () => void;
  selectedCustomer: Customer | null;
  selectedOrderType: OrderType;
  setSelectedOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customFieldValues?: Record<string, string>;
  setCustomFieldValues?: (values: Record<string, string>) => void;
}

// ============================================================================
// MEMOIZED SUB-COMPONENTS FOR PERFORMANCE
// ============================================================================

/**
 * Memoized component for rendering a single item in the cart.
 * Prevents re-rendering unless its specific props change.
 */
const MemoizedCartItem = memo(
  ({
    item,
    businessConfig,
    formatCurrency,
    onUpdateQuantity,
    onRemoveItem,
  }: {
    item: CartItem;
    businessConfig: ReturnType<typeof getBusinessConfig>;
    formatCurrency: (value: number) => string;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
  }) => (
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
  )
);
MemoizedCartItem.displayName = 'MemoizedCartItem';

/**
 * Memoized component for rendering the cart's financial summary.
 */
const CartSummary = memo(
  ({
    summary,
    businessConfig,
    formatCurrency,
    onProceed,
    isCartEmpty,
    discountPercentage,
    setDiscountPercentage,
  }: {
    summary: { subtotal: number; discount: number; tax: number; total: number };
    businessConfig: ReturnType<typeof getBusinessConfig>;
    formatCurrency: (value: number) => string;
    onProceed: () => void;
    isCartEmpty: boolean;
    discountPercentage: number;
    setDiscountPercentage: (value: number) => void;
  }) => {
    const [promoCode, setPromoCode] = useState('');

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
              <Input
                type="number"
                min="0"
                max="100"
                className="w-16 h-7 text-xs"
                value={discountPercentage}
                onChange={e => setDiscountPercentage(Number(e.target.value))}
              />
              <span>%</span>
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
CartSummary.displayName = 'CartSummary';

export function CartDetails({
  businessType,
  cartItems,
  updateQuantity,
  removeItem,
  clearCart,
  onProceedPayment,
  onOpenCustomer,
  selectedCustomer,
  selectedOrderType,
  setSelectedOrderType,
  tableNumber,
  setTableNumber,
  customFieldValues = {},
  setCustomFieldValues,
}: CartDetailsProps) {
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const { taxRate, currency } = useOrgStore();
  const formatCurrency = useFormattedCurrency();

  // Memoize business configuration to prevent recalculation on every render
  const businessConfig = useMemo(() => getBusinessConfig(businessType), [businessType]);

  /**
   * Memoized calculation for the cart summary.
   * Tax is calculated as INCLUSIVE. The item prices are assumed to already contain the tax.
   * This calculation only runs when cart items, tax rate, or discount percentage change.
   */
  const summary = useMemo(() => {
    const grossTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const discount = grossTotal * (discountPercentage / 100);
    const total = grossTotal - discount;
    const subtotal = total / (1 + Number(taxRate));
    const tax = total - subtotal;

    return { subtotal, discount, tax, total };
  }, [cartItems, taxRate, discountPercentage]);

  const showLocationField = useMemo(
    () => requiresLocationForOrderType(businessConfig, selectedOrderType),
    [businessConfig, selectedOrderType]
  );

  const handleUpdateQuantity = useCallback(
    (id: string, quantity: number) => {
      updateQuantity(id, quantity);
    },
    [updateQuantity]
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem]
  );

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    if (setCustomFieldValues) {
      setCustomFieldValues({
        ...customFieldValues,
        [fieldId]: value,
      });
    }
  };

  //eslint-disable-next-line
  const renderCustomField = (field: any) => {
    const value = customFieldValues[field.id] || '';

    switch (field.type) {
      case 'select':
        return (
          <Select key={field.id} value={value} onValueChange={val => handleCustomFieldChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            key={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={e => handleCustomFieldChange(field.id, e.target.value)}
          />
        );

      case 'date':
        return (
          <Input
            key={field.id}
            type="date"
            placeholder={field.placeholder}
            value={value}
            onChange={e => handleCustomFieldChange(field.id, e.target.value)}
          />
        );

      default:
        return (
          <Input
            key={field.id}
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={e => handleCustomFieldChange(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xs border h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Cart Details</h2>
        <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">{businessConfig.name}</div>
      </div>

      {/* Order type selector */}
      <div className="p-4 border-b">
        <RadioGroup
          value={selectedOrderType}
          onValueChange={value => setSelectedOrderType(value as OrderType)}
          className={`grid grid-cols-${Math.min(businessConfig.orderTypes.length, 3)} gap-2`}
        >
          {businessConfig.orderTypes.map(orderType => (
            <div key={orderType} className="flex items-center space-x-2 justify-center">
              <RadioGroupItem value={orderType} id={orderType.toLowerCase().replace(/\s+/g, '-')} />
              <Label htmlFor={orderType.toLowerCase().replace(/\s+/g, '-')} className="text-sm">
                {orderType}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Customer information */}
      <div className="border-b">
        <div
          className="p-4 flex justify-between items-center cursor-pointer"
          onClick={() => setIsCustomerInfoOpen(!isCustomerInfoOpen)}
        >
          <h3 className="font-medium">
            {businessConfig.requiresCustomer ? 'Customer information *' : 'Customer information'}
          </h3>
          <Button variant="ghost" size="icon">
            {isCustomerInfoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {isCustomerInfoOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="customer-name">Customer</Label>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onOpenCustomer}>
                <User className="mr-1 h-3 w-3" />
                {selectedCustomer ? 'Change Customer' : 'Select Customer'}
              </Button>
            </div>

            {selectedCustomer ? (
              <div className="p-2 border rounded-md">
                <div className="font-medium">{selectedCustomer.name}</div>
                {selectedCustomer.phone && (
                  <div className="text-xs text-muted-foreground">{selectedCustomer.phone}</div>
                )}
                {businessConfig.showLoyaltyPoints && selectedCustomer.loyaltyPoints !== undefined && (
                  <div className="text-xs text-muted-foreground">Loyalty Points: {selectedCustomer.loyaltyPoints}</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No customer selected</div>
            )}

            {/* Location field */}
            {showLocationField && businessConfig.locations && (
              <div>
                <Label htmlFor="location-select">{businessConfig.locationLabel}</Label>
                <Select value={tableNumber} onValueChange={setTableNumber}>
                  <SelectTrigger id="location-select" className="mt-1">
                    <SelectValue placeholder={businessConfig.locationPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {businessConfig.locations.map(location => (
                      <SelectItem key={location.id} value={location.label}>
                        {location.label}
                        {location.description && (
                          <span className="text-xs text-muted-foreground ml-2">{location.description}</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom fields */}
            {businessConfig.customFields?.map(field => (
              <div key={field.id}>
                <Label htmlFor={field.id}>
                  {field.label} {field.required && '*'}
                </Label>
                <div className="mt-1">{renderCustomField(field)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium">Order items</h3>
          {cartItems.length > 0 && (
            <Button variant="link" size="sm" className="text-red-600" onClick={clearCart}>
              <Trash2 className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>

        <div className="px-2 space-y-1 pb-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-3">
              <ShoppingCart className="h-10 w-10" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-xs">Add products to get started.</p>
            </div>
          ) : (
            cartItems.map(item => (
              <MemoizedCartItem
                key={item.id}
                item={item}
                businessConfig={businessConfig}
                formatCurrency={formatCurrency}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            ))
          )}
        </div>
      </div>

      <CartSummary
        summary={summary}
        businessConfig={businessConfig}
        formatCurrency={formatCurrency}
        onProceed={onProceedPayment}
        isCartEmpty={cartItems.length === 0}
        discountPercentage={discountPercentage}
        setDiscountPercentage={setDiscountPercentage}
      />
    </div>
  );
}
export default CartDetails;
