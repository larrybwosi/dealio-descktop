import { OrderQueue } from "@/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: OrderQueue | null;
  onUpdateStatus: (status: OrderQueue["status"]) => void;
}

export function OrderDetailsModal({
  isOpen,
  onOpenChange,
  selectedOrder,
  onUpdateStatus,
}: OrderDetailsModalProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ready-to-serve":
        return "Ready to serve";
      case "on-cooking":
        return "On cooking";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      case "pending-payment":
        return "Pending payment";
      default:
        return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
        </DialogHeader>
        {selectedOrder && (
          <div className="space-y-4">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="status">Update Status</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      Customer
                    </h4>
                    <p className="text-sm">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      Date & Time
                    </h4>
                    <p className="text-sm">{selectedOrder.datetime}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      Table/Delivery
                    </h4>
                    <p className="text-sm">{selectedOrder.tableNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      Items
                    </h4>
                    <p className="text-sm">{selectedOrder.items} items</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Order Status
                  </h4>
                  <div
                    className="inline-block px-3 py-1 text-sm rounded-full font-medium bg-opacity-10"
                    style={{
                      backgroundColor:
                        selectedOrder.status === "ready-to-serve"
                          ? "rgba(22, 163, 74, 0.2)"
                          : selectedOrder.status === "on-cooking"
                          ? "rgba(245, 158, 11, 0.2)"
                          : selectedOrder.status === "completed"
                          ? "rgba(59, 130, 246, 0.2)"
                          : selectedOrder.status === "cancelled"
                          ? "rgba(220, 38, 38, 0.2)"
                          : "rgba(147, 51, 234, 0.2)",
                      color:
                        selectedOrder.status === "ready-to-serve"
                          ? "rgb(22, 163, 74)"
                          : selectedOrder.status === "on-cooking"
                          ? "rgb(245, 158, 11)"
                          : selectedOrder.status === "completed"
                          ? "rgb(59, 130, 246)"
                          : selectedOrder.status === "cancelled"
                          ? "rgb(220, 38, 38)"
                          : "rgb(147, 51, 234)",
                    }}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      Total Amount
                    </h4>
                    <p className="text-lg font-semibold">{299}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <FileCheck className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                    <Button size="sm">
                      <FileEdit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status">
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    Update Order Status
                  </h4>
                  <RadioGroup
                    defaultValue={selectedOrder.status}
                    className="grid grid-cols-2 gap-2"
                    onValueChange={(value: OrderQueue["status"]) =>
                      onUpdateStatus(value)
                    }
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-2">
                      <RadioGroupItem value="on-cooking" id="on-cooking" />
                      <Label htmlFor="on-cooking" className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                        On Cooking
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-2">
                      <RadioGroupItem
                        value="ready-to-serve"
                        id="ready-to-serve"
                      />
                      <Label
                        htmlFor="ready-to-serve"
                        className="flex items-center"
                      >
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        Ready to Serve
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-2">
                      <RadioGroupItem value="completed" id="completed" />
                      <Label htmlFor="completed" className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        Completed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-2">
                      <RadioGroupItem value="cancelled" id="cancelled" />
                      <Label htmlFor="cancelled" className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        Cancelled
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-2">
                      <RadioGroupItem
                        value="pending-payment"
                        id="pending-payment"
                      />
                      <Label
                        htmlFor="pending-payment"
                        className="flex items-center"
                      >
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        Pending Payment
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="mt-4">
                    <Button
                      className="w-full"
                      onClick={() => onOpenChange(false)}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
