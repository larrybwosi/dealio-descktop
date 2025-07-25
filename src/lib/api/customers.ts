import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';


export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar: string | null;
  address: string | null;
  isActive: boolean;
  loyaltyPoints: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string | null;
  organizationId: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  customerTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  orders?: Order[];
}


interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  products: string[];
}



// Customers
export const useListCustomers = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, isLoading, error }= useQuery<ApiResponse<Customer[]>, Error>({
    queryKey: ['customers', organizationId],
    queryFn: () => apiClient.customers.list(organizationId!),
    enabled: !!organizationId,
  });
  return{
    data: data?.data?.customers as Customer[] || [],
    isLoading,
    error
  }
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Customer>, Error, Partial<Customer>>({
    mutationFn: data => apiClient.customers.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', organizationId] });
    },
  });
};

export const useUpdateCustomer = (customerId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Customer>, Error, Partial<Customer>>({
    mutationFn: data => apiClient.customers.update(organizationId!, customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['customer', organizationId, customerId] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: customerId => apiClient.customers.delete(organizationId!, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', organizationId] });
    },
  });
};

export const useGetCustomer = (customerId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Customer>, Error>({
    queryKey: ['customer', organizationId, customerId],
    queryFn: () => apiClient.customers.get(organizationId!, customerId),
    enabled: !!organizationId && !!customerId,
  });
};

