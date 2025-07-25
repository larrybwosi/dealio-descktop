import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, ProductSupplier, useOrgStore } from "../tanstack-axios";
import { Supplier } from "@/prisma/client";
import { toast } from "sonner";
import { SupplierFormValues } from "@/components/supplier-create-modal";

export const useListSuppliers = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['suppliers', organizationId],
    queryFn: async () => await apiClient.suppliers.list(organizationId!),
    enabled: !!organizationId,
  });
  console.log(data)
  return { data: data?.suppliers || [], isLoading, error, refetch };
};

export const useSearchSuppliers = () => {
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Supplier[]>, Error, { query: string; filters?: Record<string, any> }>({
    mutationFn: async ({ query, filters }) => await apiClient.suppliers.search(organizationId!, query, filters),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Supplier>, Error, SupplierFormValues>({
    mutationFn: async data => await apiClient.suppliers.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', organizationId] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Supplier>, Error, { supplierId: string; data: Partial<Supplier> }>({
    mutationFn: async ({ supplierId, data }) => await apiClient.suppliers.update(organizationId!, supplierId, data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['supplier', organizationId, data?.data?.id] });
      toast.success('Supplier updated successfully');
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async supplierId => await apiClient.suppliers.delete(organizationId!, supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', organizationId] });
    },
  });
};

export const useGetSupplier = (supplierId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Supplier>, Error>({
    queryKey: ['supplier', organizationId, supplierId],
    queryFn: async () => await apiClient.suppliers.get(organizationId!, supplierId),
    enabled: !!organizationId && !!supplierId,
  });
};

// Supplier Products Hooks
export const useListSupplierProducts = (supplierId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<ProductSupplier[]>, Error>({
    queryKey: ['supplier-products', organizationId, supplierId],
    queryFn: async () => await apiClient.suppliers.products.list(organizationId!, supplierId),
    enabled: !!organizationId && !!supplierId,
  });
};

export const useCreateSupplierProduct = (supplierId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<ProductSupplier>, Error, Partial<ProductSupplier>>({
    mutationFn: async data => await apiClient.suppliers.products.create(organizationId!, supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', organizationId, supplierId] });
    },
  });
};

export const useDeleteSupplierProduct = (supplierId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async productId => await apiClient.suppliers.products.delete(organizationId!, supplierId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', organizationId, supplierId] });
    },
  });
};
