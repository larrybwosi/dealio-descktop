import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, InvoiceResponse, useOrgStore } from '../tanstack-axios';
import { Order } from '@/prisma/client';
import { toast } from 'sonner';
import { Customer } from './customers';

export interface ExtendedOrder extends Order {
  total: number;
  customer: Customer
}

// Orders CRUD Operations
export const useListOrders = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Order[]>, Error>({
    queryKey: ['orders', organizationId],
    queryFn: async () => await apiClient.orders.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Order>, Error>({
    mutationFn: async data => await apiClient.orders.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', organizationId] });
      toast.success("Order Created")
    },
  });
};


export function useGetOrderStats(dateRange?: string) {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, error, isLoading } = useQuery({
    queryKey: ['orderStats', dateRange],
    queryFn: () => apiClient.orders.stats(organizationId!, dateRange),
  });

  return {
    data,
    error,
    isLoading,
  };
}

export const useGetOrder = (orderId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['order', organizationId, orderId],
    queryFn: async () => await apiClient.orders.get(organizationId!, orderId),
    enabled: !!organizationId && !!orderId,
  });

  return {
    data: data?.data,
    error,
    isLoading,
    refetch
  };
};

export const useUpdateOrder = (orderId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Order>, Error, Partial<Order>>({
    mutationFn: async data => await apiClient.orders.update(organizationId!, orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['order', organizationId, orderId] });
      toast.success("Order Updated")
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async orderId => await apiClient.orders.delete(organizationId!, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', organizationId] });
    },
  });
};

// Order Invoices
export const useGenerateInvoice = (orderId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useMutation<ApiResponse<InvoiceResponse>, Error>({
    mutationFn: async () => await apiClient.orders.generateInvoice(organizationId!, orderId),
  });
};

export const useGetInvoice = (orderId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<InvoiceResponse>, Error>({
    queryKey: ['invoice', organizationId, orderId],
    queryFn: async () => await apiClient.orders.getInvoice(organizationId!, orderId),
    enabled: !!organizationId && !!orderId,
  });
};
