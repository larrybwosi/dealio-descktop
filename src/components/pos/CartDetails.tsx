import { useState } from 'react';
import { 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Plus, 
  Trash2, 
  CreditCard, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CartItem, OrderType, Customer } from '@/types';
import { cn } from '@/lib/utils';
import {useCurrency, useStore} from '@/store';
import { formatCurrency } from '@/lib/currencyFormatter';

interface CartDetailsProps {
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
}

export function CartDetails({ 
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
  setTableNumber
}: CartDetailsProps) {
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const currency = useCurrency()

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const discount = calculateSubtotal() * 0.1; // 10% discount
  const tax = calculateSubtotal() * 0.025; // 2.5% tax
  const total = calculateSubtotal() - discount + tax;

  return (
    <div className="bg-white rounded-lg shadow-xs border h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Cart Details</h2>
      </div>

      {/* Order type selector */}
      <div className="p-4 border-b">
        <RadioGroup
          value={selectedOrderType}
          onValueChange={(value) => setSelectedOrderType(value as OrderType)}
          className="flex"
        >
          <div className="flex items-center space-x-2 flex-1 justify-center">
            <RadioGroupItem value="Dine in" id="dine-in" />
            <Label htmlFor="dine-in">Dine in</Label>
          </div>
          <div className="flex items-center space-x-2 flex-1 justify-center">
            <RadioGroupItem value="Takeaway" id="takeaway" />
            <Label htmlFor="takeaway">Takeaway</Label>
          </div>
          <div className="flex items-center space-x-2 flex-1 justify-center">
            <RadioGroupItem value="Delivery" id="delivery" />
            <Label htmlFor="delivery">Delivery</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Customer information */}
      <div className="border-b">
        <div
          className="p-4 flex justify-between items-center cursor-pointer"
          onClick={() => setIsCustomerInfoOpen(!isCustomerInfoOpen)}
        >
          <h3 className="font-medium">Customer information</h3>
          <Button variant="ghost" size="icon">
            {isCustomerInfoOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isCustomerInfoOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="customer-name">Customer</Label>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={onOpenCustomer}
              >
                <User className="mr-1 h-3 w-3" />
                {selectedCustomer ? "Change Customer" : "Select Customer"}
              </Button>
            </div>

            {selectedCustomer ? (
              <div className="p-2 border rounded-md">
                <div className="font-medium">{selectedCustomer.name}</div>
                {selectedCustomer.phone && (
                  <div className="text-xs text-muted-foreground">
                    {selectedCustomer.phone}
                  </div>
                )}
                {selectedCustomer.loyaltyPoints !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    Loyalty Points: {selectedCustomer.loyaltyPoints}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No customer selected
              </div>
            )}

            {selectedOrderType === "Dine in" && (
              <div>
                <Label htmlFor="table-location">Table location</Label>
                <Select value={tableNumber} onValueChange={setTableNumber}>
                  <SelectTrigger id="table-location" className="mt-1">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Table 1A">Table 1A</SelectItem>
                    <SelectItem value="Table 1B">Table 1B</SelectItem>
                    <SelectItem value="Table 2A">Table 2A</SelectItem>
                    <SelectItem value="Table 2B">Table 2B</SelectItem>
                    <SelectItem value="Table 3A">Table 3A</SelectItem>
                    <SelectItem value="Table 3B">Table 3B</SelectItem>
                    <SelectItem value="Table 4A">Table 4A</SelectItem>
                    <SelectItem value="Table 4B">Table 4B</SelectItem>
                    <SelectItem value="Table 5A">Table 5A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium">Order items</h3>
          {cartItems.length > 0 && (
            <Button
              variant="link"
              size="sm"
              className="text-red-600"
              onClick={clearCart}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>

        <div className="px-4 space-y-4 pb-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No items in cart
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="h-16 w-16 rounded overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x300/e2e8f0/64748b?text=Food+Image";
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
                    {item.variant && <div>Variant: {item.variant}</div>}
                    {item.addition && <div>Addition: {item.addition}</div>}
                  </div>
                  <div className="mt-1 font-medium">
                    {formatCurrency(item.price, currency)}
                  </div>
                </div>
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary and payment */}
      <div className="border-t p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span>Sub total</span>
          <span className="font-medium">
            {formatCurrency(calculateSubtotal(), currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Discount (10%)</span>
          <span className="font-medium">
            - {formatCurrency(discount, currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (2.5%)</span>
          <span className="font-medium">
            {formatCurrency(tax, currency)}
          </span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total amount</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>

        <div>
          <div className="relative mb-3">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button
              className="absolute right-1 top-1 h-7 text-xs"
              disabled={!promoCode}
            >
              Apply
            </Button>
          </div>
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700"
            onClick={onProceedPayment}
            disabled={cartItems.length === 0}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed payment
          </Button>
        </div>
      </div>
    </div>
  );
}