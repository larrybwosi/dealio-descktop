import { Order, OrderQueue } from '@/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, FileEdit, MapPin, Clock, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessConfig } from '@/types/business-config';
import { useOrderStore } from '@/store/orders';
import { useState } from 'react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: Order | null;
  onUpdateStatus: (orderId: string, status: OrderQueue['status']) => void;
  config: BusinessConfig;
}

export default function OrderDetailsModal({
  isOpen,
  onOpenChange,
  selectedOrder,
  onUpdateStatus,
  config,
}: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderQueue['status'] | null>(null);
  const { pendingOrders } = useOrderStore();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready-to-serve':
        return 'Ready to serve';
      case 'on-cooking':
        return 'On cooking';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'pending-payment':
        return 'Pending payment';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready-to-serve':
        return { bg: 'rgba(22, 163, 74, 0.2)', text: 'rgb(22, 163, 74)' };
      case 'on-cooking':
        return { bg: 'rgba(245, 158, 11, 0.2)', text: 'rgb(245, 158, 11)' };
      case 'completed':
        return { bg: 'rgba(59, 130, 246, 0.2)', text: 'rgb(59, 130, 246)' };
      case 'cancelled':
        return { bg: 'rgba(220, 38, 38, 0.2)', text: 'rgb(220, 38, 38)' };
      case 'pending-payment':
        return { bg: 'rgba(147, 51, 234, 0.2)', text: 'rgb(147, 51, 234)' };
      default:
        return { bg: 'rgba(147, 51, 234, 0.2)', text: 'rgb(147, 51, 234)' };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const handleStatusUpdate = () => {
    if (selectedOrder && selectedStatus) {
      onUpdateStatus(selectedOrder.id, selectedStatus);
      onOpenChange(false);
    }
  };

  const order = pendingOrders.find(o => o?.id === selectedOrder?.id) || selectedOrder;

  if (!order) return null;

  const statusColors = getStatusColor(order.status);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.orderNumber}</span>
            {order.saleNumber && <span className="text-sm text-muted-foreground">Sale #{order.saleNumber}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Order Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="status">Update Status</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Customer
                  </h4>
                  <p className="text-sm font-medium">{order.customer ? order.customer.name : 'Walk-in Customer'}</p>
                  {order.customer?.phone && <p className="text-xs text-muted-foreground">{order.customer.phone}</p>}
                  {order.customer?.email && <p className="text-xs text-muted-foreground">{order.customer.email}</p>}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Date & Time
                  </h4>
                  <p className="text-sm">{order.datetime}</p>
                </div>
              </div>

              {/* Order Type and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Order Type
                  </h4>
                  <p className="text-sm capitalize">{order.orderType}</p>
                  {order.tableNumber && <p className="text-xs text-muted-foreground">Table: {order.tableNumber}</p>}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-500 flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Payment
                  </h4>
                  <p className="text-sm capitalize">{order.paymentMethod.replace('-', ' ')}</p>
                </div>
              </div>

              {/* Order Status */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">Order Status</h4>
                <div
                  className="inline-block px-3 py-1 text-sm rounded-full font-medium"
                  style={{
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                  }}
                >
                  {getStatusLabel(order.status)}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Subtotal:</span>
                  <span className="text-sm font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Discount:</span>
                    <span className="text-sm font-medium text-red-600">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tax:</span>
                  <span className="text-sm font-medium">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-base font-semibold">Total:</span>
                  <span className="text-base font-semibold">{formatCurrency(order.total)}</span>
                </div>
                {order.amountPaid && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Amount Paid:</span>
                      <span className="text-sm font-medium">{formatCurrency(order.amountPaid)}</span>
                    </div>
                    {order.change && order.change > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Change:</span>
                        <span className="text-sm font-medium">{formatCurrency(order.change)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Notes</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{order.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 border-t pt-4">
                <Button size="sm" variant="outline">
                  <FileCheck className="h-4 w-4 mr-1" />
                  Invoice
                </Button>
                <Button size="sm">
                  <FileEdit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-500">Order Items ({order.items.length})</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <h5 className="font-medium">{item.name}</h5>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.selectedVariation && (
                        <p className="text-xs text-gray-500">Variation: {item.selectedVariation.name}</p>
                      )}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Add-ons: {item.selectedAddons.map(addon => addon.name).join(', ')}
                        </div>
                      )}
                      {item.notes && <p className="text-xs text-gray-500 italic">Note: {item.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="pt-2 space-y-4">
                <h4 className="text-sm font-semibold text-gray-500">Update Order Status</h4>
                <RadioGroup
                  defaultValue={order.status}
                  className="grid grid-cols-2 gap-3"
                  onValueChange={(value: OrderQueue['status']) => setSelectedStatus(value)}
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                    <RadioGroupItem value="on-cooking" id="on-cooking" />
                    <Label htmlFor="on-cooking" className="flex items-center cursor-pointer">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      On Cooking
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                    <RadioGroupItem value="ready-to-serve" id="ready-to-serve" />
                    <Label htmlFor="ready-to-serve" className="flex items-center cursor-pointer">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Ready to Serve
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                    <RadioGroupItem value="completed" id="completed" />
                    <Label htmlFor="completed" className="flex items-center cursor-pointer">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      Completed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                    <RadioGroupItem value="cancelled" id="cancelled" />
                    <Label htmlFor="cancelled" className="flex items-center cursor-pointer">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Cancelled
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 col-span-2">
                    <RadioGroupItem value="pending-payment" id="pending-payment" />
                    <Label htmlFor="pending-payment" className="flex items-center cursor-pointer">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      Pending Payment
                    </Label>
                  </div>
                </RadioGroup>
                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || selectedStatus === order.status}
                  >
                    Update Status
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
