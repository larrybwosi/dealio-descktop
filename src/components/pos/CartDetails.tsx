import { useState } from 'react';
import { Eye, ChevronDown, ChevronUp, Minus, Plus, Trash2, CreditCard, User } from 'lucide-react';
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
  const { taxRate, currency } = useOrgStore();
  const formatCurrency = useFormattedCurrency();

  const businessConfig = getBusinessConfig(businessType);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const discount = calculateSubtotal() * businessConfig.defaultDiscount;
  const tax = calculateSubtotal() * Number(taxRate);
  const total = calculateSubtotal() - discount + tax;

  const showLocationField = requiresLocationForOrderType(businessConfig, selectedOrderType);

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

        <div className="px-4 space-y-4 pb-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No items in cart</div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="h-16 w-16 rounded overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Item+Image';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.name}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {businessConfig.showItemVariants && item.variant && <div>Variant: {item.variant}</div>}
                    {businessConfig.showItemAdditions && item.addition && <div>Addition: {item.addition}</div>}
                  </div>
                  <div className="mt-1 font-medium">{formatCurrency(item.price)}</div>
                </div>
                {businessConfig.itemQuantityControls && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary and payment */}
      <div className="border-t p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span>Sub total</span>
          <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
        </div>
        {businessConfig.defaultDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span>Discount ({(businessConfig.defaultDiscount * 100).toFixed(0)}%)</span>
            <span className="font-medium">- {formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>
            {businessConfig.taxLabel || 'Tax'} ({(Number(taxRate) * 100).toFixed(1)}%)
          </span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total amount</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <div>
          <div className="relative mb-3">
            <Input placeholder="Enter promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
            <Button className="absolute right-1 top-1 h-7 text-xs" disabled={!promoCode}>
              Apply
            </Button>
          </div>
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700"
            onClick={onProceedPayment}
            disabled={cartItems.length === 0}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {businessConfig.paymentButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
export default CartDetails;