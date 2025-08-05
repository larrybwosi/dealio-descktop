import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductsApi, OrdersApi } from '@/api/api-service';
import { OrderQueue, OrderStatus } from '@/types';
import { useMemo } from 'react';
import { useOrderStore } from '@/store/orders';

// Product Query Hooks
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => ProductsApi.getProducts(),
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: () => ProductsApi.getProductsByCategory(category),
    enabled: !!category,
  });
}

export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductsApi.getProductById(productId!),
    enabled: !!productId,
  });
}

// Order Queue Query Hooks
// export function useOrderQueues() {
//   return useQuery({
//     queryKey: ['orderQueues'],
//     queryFn: () => OrdersApi.getOrderQueues(),
//   });
// }


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


export function useOrderQueuesByStatus(status: OrderStatus) {
  return useQuery({
    queryKey: ['orderQueues', 'status', status],
    queryFn: () => OrdersApi.getOrderQueuesByStatus(status),
    enabled: !!status,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) => 
      OrdersApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      // Invalidate and refetch order queues when status is updated
      queryClient.invalidateQueries({ queryKey: ['orderQueues'] });
    },
  });
}

// export function useUpdateOrderStatusMutation 