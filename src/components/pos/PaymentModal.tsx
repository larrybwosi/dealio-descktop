import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { z } from 'zod/v3';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  CreditCard,
  Smartphone,
  DollarSign,
  Check,
  ReceiptText,
  UserPlus,
  Phone,
  AlertCircle,
  QrCode,
  Copy,
  ExternalLink,
  Crown,
  Star,
  Zap,
  Info,
} from 'lucide-react';
import { useFormattedCurrency } from '@/lib/utils';
import { useOrgStore } from '@/lib/tanstack-axios';
import { getCurrentPhoneConfig } from '@/lib/phone.config';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { initiateMpesaPayment, subscribeToAbly } from '@/lib/mpesa-client';
import { useOrderStore } from '@/store/orders';
import { useCreateSale } from '@/lib/services/sales';
import type { CartItem, Customer, Order, OrderType, PaymentMethod } from '@/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { API_ENDPOINT } from '@/lib/axios';

// Memoized customer badge component
const CustomerBadge = memo(({ customer }: { customer: Customer | null }) => {
  if (!customer) return null;
  const tierLevel = customer.loyaltyPoints || 0;

  if (tierLevel >= 1000) {
    return (
      <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
        <Crown className="w-3 h-3 mr-1" /> VIP
      </Badge>
    );
  }
  if (tierLevel >= 500) {
    return (
      <Badge variant="secondary" className="bg-gradient-to-r from-purple-400 to-purple-600 text-purple-900">
        <Star className="w-3 h-3 mr-1" /> Gold
      </Badge>
    );
  }
  if (tierLevel >= 100) {
    return (
      <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900">
        <Zap className="w-3 h-3 mr-1" /> Silver
      </Badge>
    );
  }
  return <Badge variant="outline">Regular</Badge>;
});
CustomerBadge.displayName = 'CustomerBadge';

// Phone number normalization utility
const normalizePhoneNumber = (phone: string, config: { countryCode: string }): string => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith(config.countryCode)) return cleaned;
  if (cleaned.startsWith('254')) return `+${cleaned}`;
  if (cleaned.startsWith('07') || cleaned.startsWith('01')) return `${config.countryCode}${cleaned.substring(1)}`;
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) return `${config.countryCode}${cleaned}`;
  return cleaned;
};

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

const PaymentModal = ({
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
}: PaymentModalProps) => {
  // Payment method and general state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOBILE_PAYMENT');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [notes, setNotes] = useState('');
  const { mutate: createSale, isPending: isProcessing } = useCreateSale();
  const { addPendingOrder } = useOrderStore();
  const { taxRate = 0, locationId } = useOrgStore();
  const formatCurrency = useFormattedCurrency();
  const PHONE_CONFIG = getCurrentPhoneConfig();

  // Mobile payment specific state
  const [mobilePayment, setMobilePayment] = useState({
    status: 'idle' as 'idle' | 'sending' | 'sent' | 'confirmed' | 'failed',
    phoneNumber: customer?.phone || '',
    phoneError: '',
    checkoutRequestId: '',
  });

  // Memoized values
  const orderId = useMemo(() => uuidv4(), [isOpen]);
  const saleNumber = useMemo(
    () => `SALE-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    [isOpen]
  );

  // Tax-inclusive calculations
  const { totalPayable, priceBeforeTax, calculatedTax } = useMemo(() => {
    const total = subtotal - discount;
    const rate = Number(taxRate) || 0;
    const taxableAmount = total / (1 + rate);
    const taxAmount = total - taxableAmount;
    return { totalPayable: total, priceBeforeTax: taxableAmount, calculatedTax: taxAmount };
  }, [subtotal, discount, taxRate]);

  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return received > totalPayable ? received - totalPayable : 0;
  }, [cashReceived, totalPayable]);

  const paymentUrl = useMemo(
    () => `${API_ENDPOINT}/payment/${orderId}?amount=${totalPayable}&customer=${customer?.id || 'guest'}`,
    [orderId, totalPayable, customer]
  );

  // Effects
  useEffect(() => {
    setCashReceived(totalPayable.toFixed(2));
  }, [totalPayable]);

  useEffect(() => {
    if (!mobilePayment.checkoutRequestId || mobilePayment.status !== 'sent') return;

    const unsubscribe = subscribeToAbly(mobilePayment.checkoutRequestId, {
      onSuccess: () => setMobilePayment(prev => ({ ...prev, status: 'confirmed' })),
      onFailed: () => setMobilePayment(prev => ({ ...prev, status: 'failed' })),
    });

    return () => unsubscribe();
  }, [mobilePayment.checkoutRequestId, mobilePayment.status]);

  // Phone validation schema
  const phoneSchema = useMemo(
    () =>
      z.string().refine(phone => {
        const normalizedPhone = normalizePhoneNumber(phone, PHONE_CONFIG);
        return normalizedPhone.length === 13 && normalizedPhone.startsWith(PHONE_CONFIG.countryCode);
      }, `Please enter a valid ${PHONE_CONFIG.displayName} phone number`),
    [PHONE_CONFIG]
  );

  // Event handlers
  const handlePhoneNumberChange = useCallback(
    (value: string) => {
      setMobilePayment(prev => ({ ...prev, phoneNumber: value, phoneError: '' }));
      try {
        if (value.trim()) phoneSchema.parse(value);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setMobilePayment(prev => ({ ...prev, phoneError: error.errors[0].message }));
        }
      }
    },
    [phoneSchema]
  );

  const sendStkPush = useCallback(async () => {
    if (mobilePayment.phoneError || !mobilePayment.phoneNumber) return;

    setMobilePayment(prev => ({ ...prev, status: 'sending' }));
    const normalizedPhone = normalizePhoneNumber(mobilePayment.phoneNumber, PHONE_CONFIG);

    console.log('Sending STK push to:', normalizedPhone, 'Amount:', totalPayable, 'Order ID:', saleNumber);
    try {
      const { checkoutRequestId } = await initiateMpesaPayment({
        phoneNumber: normalizedPhone,
        amount: totalPayable,
        orderId: saleNumber,
      });
      setMobilePayment(prev => ({ ...prev, status: 'sent', checkoutRequestId }));
    } catch (error) {
      console.error('STK push failed:', error);
      setMobilePayment(prev => ({ ...prev, status: 'failed' }));
    }
  }, [mobilePayment.phoneNumber, mobilePayment.phoneError, totalPayable, saleNumber, PHONE_CONFIG]);

  const resetMobilePayment = useCallback(() => {
    setMobilePayment({
      status: 'idle',
      phoneNumber: customer?.phone || '',
      phoneError: '',
      checkoutRequestId: '',
    });
  }, [customer]);

  const copyPaymentUrl = useCallback(async () => {
    await writeText(paymentUrl);
    if ((await isPermissionGranted()) || (await requestPermission()) === 'granted') {
      sendNotification({ title: 'Copied!', body: 'Payment link copied to clipboard.' });
    }
  }, [paymentUrl]);

  const createOrderPayload = useCallback(
    (): Order => ({
      id: orderId,
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      items: cartItems.map(item => ({
        ...item,
        variant: item.variant || undefined,
        addition: item.addition || undefined,
        variantId: item.variantId || undefined,
        productId: item.productId || undefined,
      })),
      customer,
      subtotal: priceBeforeTax,
      discount,
      tax: calculatedTax,
      total: totalPayable,
      orderType,
      tableNumber,
      locationId,
      datetime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      notes,
      status: 'completed',
      paymentMethod,
      saleNumber,
      amountPaid: paymentMethod === 'CASH' ? parseFloat(cashReceived) || 0 : totalPayable,
      change: paymentMethod === 'CASH' ? change : 0,
      ...(paymentMethod === 'MOBILE_PAYMENT' && {
        mobilePaymentPhone: normalizePhoneNumber(mobilePayment.phoneNumber, PHONE_CONFIG),
      }),
    }),
    [
      orderId,
      cartItems,
      customer,
      priceBeforeTax,
      discount,
      calculatedTax,
      totalPayable,
      orderType,
      tableNumber,
      locationId,
      notes,
      paymentMethod,
      cashReceived,
      change,
      mobilePayment.phoneNumber,
      PHONE_CONFIG,
    ]
  );

  const handlePayment = useCallback(async () => {
    const isMobilePaymentInvalid = paymentMethod === 'MOBILE_PAYMENT' && mobilePayment.status !== 'confirmed';
    if (isProcessing || isMobilePaymentInvalid) return;

    const newOrder = createOrderPayload();

    createSale({
      ...newOrder,
      saleNumber,
      paymentStatus: 'COMPLETED',
      amountReceived: newOrder.amountPaid,
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
  }, [
    isProcessing,
    paymentMethod,
    mobilePayment.status,
    createOrderPayload,
    createSale,
    saleNumber,
    onPaymentComplete,
    onClose,
  ]);

  const handleSaveAsPending = useCallback(() => {
    const newOrder: Order = {
      id: orderId,
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      items: cartItems,
      customer,
      locationId,
      subtotal: priceBeforeTax,
      discount,
      tax: calculatedTax,
      total: totalPayable,
      orderType,
      status: 'pending-payment',
      paymentMethod: 'CASH',
      tableNumber,
      datetime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      notes,
    };

    addPendingOrder(newOrder);
    onPaymentComplete(newOrder);
    onClose();
  }, [
    orderId,
    cartItems,
    customer,
    locationId,
    priceBeforeTax,
    discount,
    calculatedTax,
    totalPayable,
    orderType,
    tableNumber,
    notes,
    addPendingOrder,
    onPaymentComplete,
    onClose,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent
            className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto"
            onInteractOutside={e => isProcessing && e.preventDefault()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <DialogHeader className="p-6 pb-4">
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 pt-0">
                {/* Left Column - QR Code and Payment Link */}
                <div className="lg:col-span-1 flex flex-col items-center p-4 border rounded-lg bg-slate-50">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-slate-600">
                    <QrCode className="w-4 h-4" /> Scan to Pay
                  </h3>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-2 bg-white rounded-lg shadow-md">
                    <QRCodeSVG value={paymentUrl} size={160} />
                  </motion.div>
                  <div className="flex items-center gap-2 mt-4 w-full">
                    <Button variant="outline" size="sm" onClick={copyPaymentUrl} className="flex-1">
                      <Copy className="w-3 h-3 mr-1.5" /> Copy Link
                    </Button>
                    <Button asChild variant="outline" size="icon" className="h-9 w-9">
                      <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>

                  {/* Order Info Badges */}
                  <div className="mt-4 flex flex-wrap gap-1 justify-center">
                    <Badge variant="outline" className="text-xs">
                      Order #{orderId.slice(-6)}
                    </Badge>
                    <Badge variant={orderType === 'Dine in' ? 'default' : 'secondary'} className="text-xs">
                      {orderType === 'Dine in' ? 'Dine In' : orderType === 'Takeaway' ? 'Takeout' : 'Delivery'}
                    </Badge>
                  </div>
                </div>

                {/* Right Column - Payment Details */}
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
                          <CustomerBadge customer={customer} />
                        </div>
                        {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                        {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No customer selected</p>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-red-600">-{formatCurrency(discount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl pt-2 border-t">
                      <span>Total Payable</span>
                      <span>{formatCurrency(totalPayable)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between items-center">
                      <span>
                        Includes Tax ({Number(taxRate) * 100}%): {formatCurrency(calculatedTax)}
                      </span>
                      <Info className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <Tabs
                      value={paymentMethod}
                      onValueChange={val => setPaymentMethod(val as PaymentMethod)}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="MOBILE_PAYMENT">
                          <Smartphone className="mr-2 h-4 w-4" />
                          Mobile
                        </TabsTrigger>
                        <TabsTrigger value="CASH">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Cash
                        </TabsTrigger>
                        <TabsTrigger value="CREDIT_CARD">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Card
                        </TabsTrigger>
                      </TabsList>

                      {/* Mobile Payment Tab */}
                      <TabsContent value="MOBILE_PAYMENT" className="pt-4">
                        <motion.div
                          key="mobile"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          {!mobilePayment.checkoutRequestId ? (
                            <div className="space-y-2">
                              <Label htmlFor="phone-number">Customer Phone ({PHONE_CONFIG.displayName})</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  id="phone-number"
                                  placeholder="e.g. 0712345678"
                                  value={mobilePayment.phoneNumber}
                                  onChange={e => handlePhoneNumberChange(e.target.value)}
                                  className={`pl-10 ${mobilePayment.phoneError ? 'border-red-500' : ''}`}
                                />
                              </div>
                              <AnimatePresence>
                                {mobilePayment.phoneError && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-sm text-red-600 flex items-center gap-1"
                                  >
                                    <AlertCircle size={14} />
                                    {mobilePayment.phoneError}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                              <p className="text-xs text-muted-foreground">
                                Supported formats: +254xxxxxxxxx, 254xxxxxxxxx, 07xxxxxxxx, 01xxxxxxxx
                              </p>
                              <Button
                                onClick={sendStkPush}
                                disabled={
                                  !!mobilePayment.phoneError ||
                                  !mobilePayment.phoneNumber ||
                                  mobilePayment.status === 'sending'
                                }
                                className="w-full"
                              >
                                {mobilePayment.status === 'sending' ? (
                                  <>
                                    <motion.div className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  `Send Payment Request (${formatCurrency(totalPayable)})`
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3 text-center">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={mobilePayment.status}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  {mobilePayment.status === 'sent' && (
                                    <Alert>
                                      <Smartphone className="h-4 w-4" />
                                      <AlertDescription>
                                        STK push sent to {mobilePayment.phoneNumber}. Waiting for confirmation...
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                  {mobilePayment.status === 'confirmed' && (
                                    <Alert variant="default">
                                      <Check className="h-4 w-4" />
                                      <AlertDescription>
                                        Payment confirmed! You can now complete the sale.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                  {mobilePayment.status === 'failed' && (
                                    <Alert variant="destructive">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>Payment failed or was cancelled by user.</AlertDescription>
                                    </Alert>
                                  )}
                                </motion.div>
                              </AnimatePresence>
                              <div className="flex gap-2 justify-center">
                                <Button
                                  onClick={sendStkPush}
                                  variant="outline"
                                  size="sm"
                                  disabled={mobilePayment.status === 'sending' || mobilePayment.status === 'confirmed'}
                                >
                                  Resend
                                </Button>
                                <Button onClick={resetMobilePayment} variant="ghost" size="sm">
                                  Change Number
                                </Button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </TabsContent>

                      {/* Cash Payment Tab */}
                      <TabsContent value="CASH" className="pt-4">
                        <motion.div
                          key="cash"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="space-y-1">
                            <Label htmlFor="cash-received">Amount Received</Label>
                            <Input
                              id="cash-received"
                              value={cashReceived}
                              onChange={e => setCashReceived(e.target.value)}
                              type="number"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Change Due</Label>
                            <div className="px-3 py-2 bg-gray-100 border rounded-md font-medium h-10 flex items-center">
                              {formatCurrency(change)}
                            </div>
                          </div>
                        </motion.div>
                      </TabsContent>

                      {/* Card Payment Tab */}
                      <TabsContent value="CREDIT_CARD" className="pt-4">
                        <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <Alert>
                            <CreditCard className="h-4 w-4" />
                            <AlertDescription>
                              Process the payment of {formatCurrency(totalPayable)} using the external card terminal,
                              then complete the sale.
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Order Notes */}
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

              <DialogFooter className="p-6 pt-2 flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={isProcessing}>
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={handleSaveAsPending}
                  disabled={isProcessing}
                >
                  <ReceiptText className="mr-2 h-4 w-4" />
                  Save as Pending
                </Button>
                <Button
                  onClick={handlePayment}
                  className="w-full sm:w-auto"
                  disabled={
                    isProcessing ||
                    (paymentMethod === 'CASH' && (parseFloat(cashReceived) || 0) < totalPayable) ||
                    (paymentMethod === 'MOBILE_PAYMENT' && mobilePayment.status !== 'confirmed')
                  }
                >
                  {isProcessing ? (
                    <>
                      <motion.div className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Complete Payment
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default memo(PaymentModal)