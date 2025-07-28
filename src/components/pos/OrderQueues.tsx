import { useState, useRef } from 'react';
import { Eye, Utensils, Armchair, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OrderQueue } from '@/types';
import { cn } from '@/lib/utils';
import { useOrderQueues } from '@/hooks/use-query-hooks';
import { OrderDetailsModal } from './OrderDetailsModal';

export function OrderQueues() {
  const { data: orderQueues, isLoading: isLoading } = useOrderQueues();
  const [selectedOrder, setSelectedOrder] = useState<OrderQueue | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleUpdateStatus = (status: OrderQueue['status']) => {
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ready-to-serve':
        return 'bg-green-100 text-green-800';
      case 'on-cooking':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending-payment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const LoadingSkeleton = () => (
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-3 space-y-2 shrink-0" style={{ width: '20%' }}>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Skeleton className="h-3 w-3 mr-1 rounded-sm" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-3 w-3 mr-1 rounded-sm" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xs border">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Order queues</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Eye className="h-5 w-5" />
              </Button>
              <Button variant="link" className="text-sm font-medium">
                View All
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>

        <CollapsibleContent className="px-4 pb-4">
          {isLoading ? (
            <div className="space-y-4">
              {/* Navigation skeleton */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
              </div>

              {/* Cards skeleton */}
              <LoadingSkeleton />

              {/* Pagination skeleton */}
              <div className="flex justify-center mt-3 space-x-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="w-2 h-2 rounded-full" />
                ))}
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Navigation buttons */}
              <div className="flex justify-between items-center mb-4">
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
                      className="border rounded-lg p-3 space-y-2 shrink-0 hover:shadow-md transition-shadow"
                      style={{ width: '20%' }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">{queue.orderNumber}</span>
                        <span
                          className={cn('px-2 py-1 text-xs font-medium rounded-md', getStatusBadgeClass(queue.status))}
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
                          className="text-xs hover:bg-gray-100"
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
                  {Array.from({ length: Math.ceil(orderQueues.length / 5) }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        Math.floor(currentIndex / 5) === index ? 'bg-blue-500' : 'bg-gray-300'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <OrderDetailsModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        selectedOrder={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
