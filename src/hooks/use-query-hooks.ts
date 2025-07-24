import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductsApi, OrdersApi } from '@/api/api-service';
import { OrderStatus } from '@/types';

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
export function useOrderQueues() {
  return useQuery({
    queryKey: ['orderQueues'],
    queryFn: () => OrdersApi.getOrderQueues(),
  });
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