import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CartItem, Customer, Order, OrderType, PaymentMethod } from '@/types';
import { CreditCard, Smartphone, DollarSign, Check, ReceiptText, UserPlus } from 'lucide-react';
import { useFormattedCurrency } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customer: Customer | null;
  orderType: OrderType;
  tableNumber: string;
  onOpenCustomer: () => void;
  onPaymentComplete: (order: Order) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discount,
  tax,
  total,
  customer,
  orderType,
  tableNumber,
  onOpenCustomer,
  onPaymentComplete,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<Omit<PaymentMethod, 'Pending'>>('Mobile Payment');
  const [cashReceived, setCashReceived] = useState<string>(total.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');

  const generateOrderNumber = () => {
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${month}${String(date.getDate()).padStart(2, '0')}${random}`;
  };

  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return received > total ? received - total : 0;
  };

  const handlePayment = () => {
    setIsProcessing(true);

    const received = parseFloat(cashReceived) || 0;

    // Create order object
    const newOrder: Order = {
      id: uuidv4(),
      orderNumber: generateOrderNumber(),
      items: [...cartItems],
      customer: customer,
      subtotal,
      discount,
      tax,
      total,
      orderType,
      status: 'completed',
      paymentMethod: paymentMethod as PaymentMethod,
      tableNumber,
      datetime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      notes,
      // --- ✨ New data being added ---
      amountPaid: paymentMethod === 'cash' ? received : total,
      change: paymentMethod === 'cash' ? calculateChange() : 0,
    };

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete(newOrder);
      onClose();
    }, 1000);
  };

  const formatCurrency = useFormattedCurrency()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Section */}
          <div className="p-4 border rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Customer Information</h3>
              <Button variant="outline" size="sm" onClick={onOpenCustomer}>
                <UserPlus className="mr-1 h-3 w-3" />
                {customer ? 'Change' : 'Select'} Customer
              </Button>
            </div>
            {customer ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">{customer.name}</p>
                {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No customer selected</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span> {formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount (10%):</span>
              <span> {formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (2.5%):</span>
              <span> {formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total:</span>
              <span> {formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <Tabs
              defaultValue="mobile"
              onValueChange={value => {
                setPaymentMethod(value as 'mobile' | 'cash' | 'card');
              }}
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="mobile">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mobile
                </TabsTrigger>
                <TabsTrigger value="cash">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Cash
                </TabsTrigger>
                <TabsTrigger value="card">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Card
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mobile" className="pt-4 space-y-3">
                <p className="text-sm">The customer will receive a QR code to make the payment.</p>
              </TabsContent>

              <TabsContent value="cash" className="pt-4 space-y-3">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="cash-received">Cash Received</Label>
                      <Input
                        id="cash-received"
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
                        type="number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="change">Change</Label>
                      <Input id="change" value={calculateChange()} disabled />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="card" className="pt-4 space-y-3">
                <p className="text-sm">Process card payment using the card terminal.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes</Label>
            <Input
              id="notes"
              placeholder="Add any special instructions"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full" disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="sm:w-auto w-full"
            disabled={isProcessing || (paymentMethod === 'cash' && parseFloat(cashReceived) < total)}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Complete Payment
              </div>
            )}
          </Button>
          <Button
            variant="secondary"
            className="sm:w-auto w-full"
            onClick={() => {
              const newOrder: Order = {
                id: uuidv4(),
                orderNumber: generateOrderNumber(),
                items: [...cartItems],
                customer: customer,
                subtotal,
                discount,
                tax,
                total,
                orderType,
                status: 'pending-payment',
                paymentMethod: 'Pending',
                tableNumber,
                datetime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                notes,
              };
              onPaymentComplete(newOrder);
              onClose();
            }}
          >
            <ReceiptText className="mr-2 h-4 w-4" />
            Save as Pending
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
