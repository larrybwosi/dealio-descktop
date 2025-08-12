import { Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { OrderQueue } from '@/types';
import { BusinessConfig } from '@/types/business-config';

interface OrderQueueCardProps {
  queue: OrderQueue;
  config: BusinessConfig;
  onViewOrder: (queue: OrderQueue) => void;
  getStatusBadgeClass: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

// Helper to safely access nested properties like 'details.project_type'
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNestedValue = (obj: any, path: string) => {
  if (!path) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function OrderQueueCard({
  queue,
  config,
  onViewOrder,
  getStatusBadgeClass,
  getStatusLabel,
}: OrderQueueCardProps) {

  const fieldsWithValues =
    config?.queueCardDisplay?.filter(field => {
      const value = getNestedValue(queue, field.key as string);
      return value !== null && value !== undefined;
    }) || [];

  return (
    <div className="border rounded-lg p-2 bg-white hover:shadow-md transition-all duration-200 min-w-0 flex-shrink-0 w-full max-w-sm">
      {/* Header with order number, customer name and status */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-mono text-muted-foreground">#{queue.orderNumber}</div>
          <div className="font-semibold text-foreground truncate" title={queue.customerName}>
            {queue.customerName}
          </div>
        </div>
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0',
            getStatusBadgeClass(queue.status)
          )}
        >
          {getStatusLabel(queue.status)}
        </span>
      </div>

      {/* Date/time and dynamic fields in two columns */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm mb-3">
        <div className="text-muted-foreground col-span-2">{queue.datetime}</div>

        {fieldsWithValues.map((field, index) => {
          const value = getNestedValue(queue, field.key as string);
          const Icon = field.icon;

          return (
            <div key={`${field.key}-${index}`} className="flex items-center gap-1 min-w-0">
              {Icon && <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
              <span className="truncate text-xs">
                {value}
                {field.label && <span className="text-muted-foreground ml-1">{field.label}</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer with action button */}
      <div className="flex justify-end pt-1 border-t">
        <Button variant="ghost" size="sm" onClick={() => onViewOrder(queue)} className="text-xs hover:bg-muted h-7">
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
      </div>
    </div>
  );
}
