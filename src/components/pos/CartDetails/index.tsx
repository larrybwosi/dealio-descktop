import { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, CreditCard, User, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CartItem, OrderType, Customer } from '@/types';
import { BusinessType, getBusinessConfig, requiresLocationForOrderType } from '@/types/business-config';
import { useOrgStore } from '@/lib/tanstack-axios';
import { CartItemComponent } from './cart-item';
import { CartSummaryComponent } from './cart-summary';

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
  onDiscountChange: (value: number) => void;
  discountValue: number;
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
  onDiscountChange,
  discountValue,
}: CartDetailsProps) {
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(true);
  const { taxRate } = useOrgStore();

  const businessConfig = useMemo(() => getBusinessConfig(businessType), [businessType]);

  const summary = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const discount = Math.min(discountValue, subtotal); // Ensure discount doesn't exceed subtotal
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * Number(taxRate);
    const total = taxableAmount + tax;

    return { subtotal, discount, tax, total };
  }, [cartItems, taxRate, discountValue]);

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
              <CartItemComponent
                key={item.id}
                item={item}
                businessConfig={businessConfig}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            ))
          )}
        </div>
      </div>

      <CartSummaryComponent
        summary={summary}
        businessConfig={businessConfig}
        onProceed={onProceedPayment}
        isCartEmpty={cartItems.length === 0}
        discountValue={discountValue}
        onDiscountValueChange={onDiscountChange}
      />
    </div>
  );
}

export default CartDetails;
