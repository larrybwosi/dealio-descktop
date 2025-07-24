import { useState, useRef, useEffect } from "react";
import {
  Eye,
  Utensils,
  Armchair,
  FileEdit,
  FileCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useStore } from "@/store";
import { useOrderQueues } from "@/hooks/use-query-hooks";

interface OrderQueuesProps {
  onViewOrder?: (order: OrderQueue) => void;
}

export function OrderQueues({ onViewOrder }: OrderQueuesProps) {
  const { data: orderQueues, isLoading: loadingOrderQueues } = useOrderQueues();
  const [selectedOrder, setSelectedOrder] = useState<OrderQueue | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isLoading = false;

  // Set fixed number of cards per view
  useEffect(() => {
    setCardsPerView(5);
  }, []);

  const maxIndex = Math.max(0, (orderQueues?.length || 0) - 5);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  const handleScrollLeft = () => {
    setCurrentIndex(Math.max(0, currentIndex - 5));
  };

  const handleScrollRight = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 5));
  };

  const handleViewOrder = (order: OrderQueue) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleUpdateStatus = (status: OrderQueue["status"]) => {
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ready-to-serve":
        return "bg-green-100 text-green-800";
      case "on-cooking":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending-payment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
    <div className="bg-white p-4 rounded-lg shadow-xs border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order queues</h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Eye className="h-5 w-5" />
          </Button>
          <Button variant="link" className="text-sm font-medium">
            View All
          </Button>
        </div>
      </div>

      {isLoading || loadingOrderQueues ? (
        <></>
      ) : (
        <div className="relative">
          {/* Navigation buttons */}
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Cards container */}
          <div ref={containerRef} className="overflow-hidden">
            <div
              className="flex gap-2 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 20}%)`,
                width: `${(orderQueues?.length || 0) * 20}%`,
              }}
            >
              {orderQueues?.map((queue, index) => (
                <div
                  key={queue.id}
                  ref={index === 0 ? cardRef : undefined}
                  className="border rounded-lg p-3 space-y-2 shrink-0"
                  style={{ width: "20%" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{queue.orderNumber}</span>
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-md",
                        getStatusBadgeClass(queue.status)
                      )}
                    >
                      {getStatusLabel(queue.status)}
                    </span>
                  </div>

                  <div className="font-medium">{queue.customerName}</div>
                  <div className="text-sm text-gray-500">{queue.datetime}</div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-sm">
                      <div className="flex items-center mr-4">
                        <Utensils className="h-3 w-3 mr-1" />
                        <span>{queue.items} items</span>
                      </div>
                      <div className="flex items-center">
                        <Armchair className="h-3 w-3 mr-1" />
                        <span>{queue.tableNumber}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(queue)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" /> View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page indicator */}
          {orderQueues && orderQueues.length > 5 && (
            <div className="flex justify-center mt-3 space-x-1">
              {Array.from({ length: Math.ceil(orderQueues.length / 5) }).map(
                (_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      Math.floor(currentIndex / 5) === index
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    )}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Order details modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
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
                        handleUpdateStatus(value)
                      }
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-2">
                        <RadioGroupItem value="on-cooking" id="on-cooking" />
                        <Label
                          htmlFor="on-cooking"
                          className="flex items-center"
                        >
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
                        <Label
                          htmlFor="completed"
                          className="flex items-center"
                        >
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          Completed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-2">
                        <RadioGroupItem value="cancelled" id="cancelled" />
                        <Label
                          htmlFor="cancelled"
                          className="flex items-center"
                        >
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
                        onClick={() => setIsViewModalOpen(false)}
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
            <Button
              variant="secondary"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
