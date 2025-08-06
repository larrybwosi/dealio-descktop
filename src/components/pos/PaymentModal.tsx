import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { z } from 'zod/v4';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CartItem, Customer, Order, OrderType } from '@/types';
import {
  CreditCard,
  Smartphone,
  DollarSign,
  Check,
  ReceiptText,
  UserPlus,
  Percent,
  Phone,
  AlertCircle,
  QrCode,
  Copy,
  ExternalLink,
  Crown,
  Star,
  Zap,
} from 'lucide-react';
import { useFormattedCurrency } from '@/lib/utils';
import { useOrgStore } from '@/lib/tanstack-axios';
import { getCurrentPhoneConfig, PHONE_CONFIGS } from '@/lib/phone.config';
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { PaymentMethod } from '@/prisma/client';
import { initiateMpesaPayment, subscribeToAbly } from '@/lib/mpesa-client';
import { useOrderStore } from '@/store/orders';
import { useCreateSale } from '@/lib/services/sales';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  customer: Customer | null;
  orderType: OrderType;
  tableNumber: string;
  onOpenCustomer: () => void;
  onPaymentComplete: (order: Order) => void;
}

// Phone number configuration - can be moved to a config file later
interface PhoneConfig {
  countryCode: string;
  formats: string[];
  displayName: string;
}

// Phone number validation schema
const createPhoneSchema = (config: PhoneConfig) => {
  return z
    .string()
    .min(1, 'Phone number is required')
    .refine(phone => {
      const normalizedPhone = normalizePhoneNumber(phone, config);
      // Kenya phone numbers should be 13 characters including +254
      return normalizedPhone.length === 13 && normalizedPhone.startsWith(config.countryCode);
    }, `Please enter a valid ${config.displayName} phone number`);
};

// Normalize phone number to international format
const normalizePhoneNumber = (phone: string, config: PhoneConfig): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Handle different input formats
  if (cleaned.startsWith(config.countryCode)) {
    return cleaned; // Already in correct format
  }

  if (cleaned.startsWith('254')) {
    return '+' + cleaned; // Add + to 254xxxxxxxxx
  }

  if (cleaned.startsWith('07') || cleaned.startsWith('01')) {
    // Convert 07xxxxxxxx or 01xxxxxxxx to +254xxxxxxxxx
    return config.countryCode + cleaned.substring(1);
  }

  if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    // Convert 7xxxxxxxx or 1xxxxxxxx to +254xxxxxxxxx
    return config.countryCode + cleaned;
  }

  return cleaned; // Return as is if no pattern matches
};

export function PaymentModal({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discount,
  customer,
  orderType,
  tableNumber,
  onOpenCustomer,
  onPaymentComplete,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<Omit<PaymentMethod, ''>>('MOBILE_PAYMENT');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [notes, setNotes] = useState('');
  const { mutate: createSale, isPending: isProcessing } = useCreateSale();
  const { addPendingOrder } = useOrderStore();

  // Mobile payment states
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [stkPushSent, setStkPushSent] = useState(false);
  const [stkPushStatus, setStkPushStatus] = useState<'idle' | 'sending' | 'sent' | 'confirmed' | 'failed'>('idle');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string>('');

  // Generate a unique order ID for QR code
  const orderId = useMemo(() => uuidv4(), [isOpen]);
  const saleNumber = useMemo(
    () => `SALE-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    [isOpen]
  );

    useEffect(() => {
      if (!checkoutRequestId || !stkPushSent) return;

      const unsubscribe = subscribeToAbly(checkoutRequestId, {
        onSuccess: () => {
          setStkPushStatus('confirmed');
        },
        onFailed: message => {
          setStkPushStatus('failed');
          console.error('Payment failed:', message);
        },
      });

      return () => {
        unsubscribe();
      };
    }, [checkoutRequestId, stkPushSent]);


  const { taxRate, locationId } = useOrgStore();
  const PHONE_CONFIG = getCurrentPhoneConfig();
  const phoneSchema = createPhoneSchema(PHONE_CONFIG);

  // Recalculate totals when discount changes
  const calculatedTax = subtotal * Number(taxRate);
  const calculatedTotal = subtotal - discount + calculatedTax;

  // Update cash received when total changes
  useEffect(() => {
    setCashReceived(calculatedTotal.toString());
  }, [calculatedTotal]);

  // Generate payment URL
  const paymentUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment/${orderId}?amount=${calculatedTotal}&customer=${customer?.id || 'guest'}`;
  }, [orderId, customer]);

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
    return received > calculatedTotal ? received - calculatedTotal : 0;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    try {
      phoneSchema.parse(phone);
      setPhoneError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPhoneError(error.format().message);
      }
      return false;
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (value.trim()) {
      validatePhoneNumber(value);
    } else {
      setPhoneError('');
    }
  };

  const sendStkPush = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setStkPushStatus('sending');
    const normalizedPhone = normalizePhoneNumber(phoneNumber, PHONE_CONFIG);

    try {
      await initiateMpesaPayment({
        phoneNumber: normalizedPhone,
        amount: calculatedTotal,
        orderId: saleNumber,
      });
      setStkPushStatus('sent');
      setStkPushSent(true);

      // Start polling for payment confirmation (simulate)
      setTimeout(() => {
        setStkPushStatus('confirmed');
      }, 5000);
    } catch (error) {
      console.error('STK push failed:', error);
      setStkPushStatus('failed');
    }
  };

  const resetMobilePayment = () => {
    setStkPushSent(false);
    setStkPushStatus('idle');
    setPhoneNumber('');
    setPhoneError('');
  };

  const copyPaymentUrl = async() => {
    await writeText(paymentUrl);
    let permissionGranted = await isPermissionGranted();

    // If not we need to request it
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }

    // Once permission has been granted we can send the notification
    if (permissionGranted) {
      sendNotification({ title: 'Copied!', body: 'The link has been copied to the clipboard' });
    }

    // You might want to show a toast notification here
  };

  const handlePayment = async () => {
    // For mobile payments, check if STK push is confirmed
    if (paymentMethod === 'MOBILE_PAYMENT' && stkPushStatus !== 'confirmed') {
      return;
    }

    const received = parseFloat(cashReceived) || 0;
    // Create order object
    const newOrder: Order = {
      id: orderId,
      orderNumber: generateOrderNumber(),
      items: [...cartItems],
      customer: customer,
      subtotal,
      discount: discount,
      tax: calculatedTax,
      total: calculatedTotal,
      orderType,
      status: 'completed',
      paymentMethod: paymentMethod as PaymentMethod,
      tableNumber,
      locationId,
      datetime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      notes,
      // --- ✨ New data being added ---
      amountPaid: paymentMethod === 'CASH' ? received : calculatedTotal,
      change: paymentMethod === 'CASH' ? calculateChange() : 0,
      // Add mobile payment details if applicable
      ...(paymentMethod === 'mobile' && {
        mobilePaymentPhone: normalizePhoneNumber(phoneNumber, PHONE_CONFIG),
      }), 
    };
    console.log('Creating order:', cashReceived, 'change:', calculateChange());
    createSale({
      ...newOrder,
      paymentStatus: 'COMPLETED',
      amountReceived: paymentMethod === 'CASH' ? parseFloat(cashReceived) : calculatedTotal,
      change: paymentMethod === 'CASH' ? calculateChange() : 0,
      saleNumber,
      cartItems: cartItems.map(item => ({
        ...item,
        variant: item.variant || undefined,
        addition: item.addition || undefined,
        variantId: item.variantId || undefined,
        productId: item.productId || undefined,
      })),
    });
      onPaymentComplete(newOrder);
      onClose();
      resetMobilePayment();
  };

  const handleSaveAsPending = () => {
    const newOrder: Order = {
      id: orderId,
      orderNumber: generateOrderNumber(),
      items: [...cartItems],
      customer: customer,
      locationId,
      subtotal,
      discount: discount,
      tax: calculatedTax,
      total: calculatedTotal,
      orderType,
      status: 'pending-payment',
      paymentMethod: 'CASH',
      tableNumber,
      datetime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      notes,
    };

    // Save to local storage
    addPendingOrder(newOrder);
    onPaymentComplete(newOrder);
    onClose();
  };

  const formatCurrency = useFormattedCurrency();

  // Get customer tier badge
  const getCustomerBadge = () => {
    if (!customer) return null;

    // This would typically come from customer data
    const tierLevel = customer.loyaltyPoints || 0;

    if (tierLevel >= 1000) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
          <Crown className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      );
    } else if (tierLevel >= 500) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-400 to-purple-600 text-purple-900">
          <Star className="w-3 h-3 mr-1" />
          Gold
        </Badge>
      );
    } else if (tierLevel >= 100) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900">
          <Zap className="w-3 h-3 mr-1" />
          Silver
        </Badge>
      );
    }

    return <Badge variant="outline">Regular</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Payment Details
            {discount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Discount Applied
              </Badge>
            )}
            {orderType === 'Dine in' && <Badge variant="outline">Table {tableNumber}</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - QR Code */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-medium mb-3 flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Payment QR Code
                </h3>
                <QRCodeSVG value={paymentUrl} size={180} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyPaymentUrl} className="flex-1">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(paymentUrl, '_blank')}>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan to pay or share this link with the customer
                </p>
              </div>

              {/* Order Info Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="outline" className="text-xs">
                    Order #{orderId.slice(-6)}
                  </Badge>
                  <Badge variant={orderType === 'Dine in' ? 'default' : 'secondary'} className="text-xs">
                    {orderType === 'Dine in' ? 'Dine In' : orderType === 'Takeaway' ? 'Takeout' : 'Delivery'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{customer.name}</p>
                    {getCustomerBadge()}
                  </div>
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
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  Discount:
                  {discount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Applied
                    </Badge>
                  )}
                </span>
                <span>-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({Number(taxRate) * 100}%):</span>
                <span>{formatCurrency(calculatedTax)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total:</span>
                <span className="text-lg">{formatCurrency(calculatedTotal)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <Tabs
                defaultValue="MOBILE_PAYMENT"
                onValueChange={value => {
                  setPaymentMethod(value);
                }}
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="MOBILE_PAYMENT" className="flex items-center justify-center">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Mobile
                  </TabsTrigger>
                  <TabsTrigger value="CASH" className="flex items-center justify-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Cash
                  </TabsTrigger>
                  <TabsTrigger value="CREDIT_CARD">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Card
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="MOBILE_PAYMENT" className="pt-4 space-y-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Customer Phone Number ({PHONE_CONFIG.displayName})</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone-number"
                          placeholder="07xxxxxxxx or 01xxxxxxxx"
                          value={phoneNumber}
                          onChange={e => handlePhoneNumberChange(e.target.value)}
                          className={`pl-10 ${phoneError ? 'border-red-500' : ''}`}
                          disabled={stkPushSent}
                        />
                      </div>
                      {phoneError && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {phoneError}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Supported formats: +254xxxxxxxxx, 254xxxxxxxxx, 07xxxxxxxx, 01xxxxxxxx
                      </p>
                    </div>

                    {!stkPushSent ? (
                      <Button
                        onClick={sendStkPush}
                        disabled={!phoneNumber || !!phoneError || stkPushStatus === 'sending'}
                        className="w-full"
                        variant="outline"
                      >
                        {stkPushStatus === 'sending' ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Sending STK Push...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Smartphone className="mr-2 h-4 w-4" />
                            Send STK Push ({formatCurrency(calculatedTotal)})
                          </div>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        {stkPushStatus === 'sent' && (
                          <Alert>
                            <Smartphone className="h-4 w-4" />
                            <AlertDescription>
                              STK push sent to {normalizePhoneNumber(phoneNumber, PHONE_CONFIG)}. Please check your
                              phone and enter your M-Pesa PIN to complete the payment.
                            </AlertDescription>
                          </Alert>
                        )}

                        {stkPushStatus === 'confirmed' && (
                          <Alert className="border-green-200 bg-green-50">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              Payment confirmed! You can now complete the order.
                            </AlertDescription>
                          </Alert>
                        )}

                        {stkPushStatus === 'failed' && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              Payment failed or was cancelled. Please try again.
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => sendStkPush()}
                            variant="outline"
                            size="sm"
                            disabled={stkPushStatus === 'sending' || stkPushStatus === 'confirmed'}
                          >
                            Resend STK Push
                          </Button>
                          <Button onClick={resetMobilePayment} variant="outline" size="sm">
                            Change Number
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="CASH" className="pt-4 space-y-3">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="cash-received">Cash Received</Label>
                        <Input
                          id="cash-received"
                          value={cashReceived}
                          onChange={e => setCashReceived(e.target.value)}
                          type="number"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="change">Change</Label>
                        <div className="px-3 py-2 bg-gray-50 border rounded font-medium">
                          {formatCurrency(calculateChange())}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="CREDIT_CARD" className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Secure Payment
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      PCI Compliant
                    </Badge>
                  </div>
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
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full" disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="sm:w-auto w-full"
            disabled={
              isProcessing ||
              (paymentMethod === 'CASH' && parseFloat(cashReceived) < calculatedTotal) ||
              (paymentMethod === 'MOBILE_PAYMENT' && stkPushStatus !== 'confirmed')
            }
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
          <Button variant="secondary" className="sm:w-auto w-full" onClick={handleSaveAsPending}>
            <ReceiptText className="mr-2 h-4 w-4" />
            Save as Pending
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
