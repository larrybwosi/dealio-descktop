import { OrderQueue, OrderStatus } from '@/types';
import { useMemo } from 'react';
import { useOrderStore } from '@/store/orders';


/**
 * A custom hook that provides a reactive and memoized list of order queues.
 *
 * It subscribes to the `pendingOrders` from `useOrderStore` and transforms
 * them into a simplified `OrderQueue` format for UI display. The component
 * using this hook will automatically re-render whenever the pending orders change.
 */
export function useOrderQueues() {
  // By selecting `state.pendingOrders` directly, the hook creates a subscription.
  // The component will now re-render whenever this specific piece of state is updated.
  const orders = useOrderStore(state => state.pendingOrders);

  // `useMemo` ensures the mapping logic only runs when the `orders` array changes,
  // preventing unnecessary recalculations on other component re-renders.
  const orderQueues: OrderQueue[] = useMemo(() => {
    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer?.name ?? 'Guest',
      datetime: order.datetime,
      status: order.status,
      items: order.items.length,
      tableNumber: order.tableNumber ?? 'N/A',
    }));
  }, [orders]);

  return {
    data: orderQueues,
    isLoading: false,
    error: null,
  };
}

