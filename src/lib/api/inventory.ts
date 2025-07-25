import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '../tanstack-axios';
import { InventoryAdjustment, InventoryItem, InventoryMovement } from '../types/inventory';

export const useListInventory = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery({
    queryKey: ['inventory', organizationId],
    queryFn: async () => await apiClient.inventory.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<InventoryItem>, Error, Partial<InventoryItem>>({
    mutationFn: async data => await apiClient.inventory.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', organizationId] });
    },
  });
};
export const useGetInventoryItem = (inventoryId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery({
    queryKey: ['inventory', organizationId, inventoryId],
    queryFn: async () => await apiClient.inventory.get(organizationId!, inventoryId),
    enabled: !!organizationId && !!inventoryId,
  });
};

export const useUpdateInventoryItem = (inventoryId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<InventoryItem>, Error, Partial<InventoryItem>>({
    mutationFn: async data => await apiClient.inventory.update(organizationId!, inventoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['inventory', organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['inventory', organizationId, inventoryId],
      });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<void, Error, string>({
    mutationFn: async inventoryId => await apiClient.inventory.delete(organizationId!, inventoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['inventory', organizationId],
      });
    },
  });
};

export const useListInventoryMovements = (inventoryId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery({
    queryKey: ['inventory-movements', organizationId, inventoryId],
    queryFn: async () => await apiClient.inventory.movements.list(organizationId!, inventoryId),
    enabled: !!organizationId && !!inventoryId,
  });
};

export const useCreateInventoryMovement = (inventoryId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<InventoryMovement>, Error, Partial<InventoryMovement>>({
    mutationFn: async data => await apiClient.inventory.movements.create(organizationId!, inventoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['inventory-movements', organizationId, inventoryId],
      });
    },
  });
};

export const useListInventoryAdjustments = (inventoryId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery({
    queryKey: ['inventory-adjustments', organizationId, inventoryId],
    queryFn: async () => await apiClient.inventory.adjustments.list(organizationId!, inventoryId),
    enabled: !!organizationId && !!inventoryId,
  });
};

export const useApproveInventoryAdjustment = (inventoryId: string, adjustmentId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<InventoryAdjustment>, Error>({
    mutationFn: async () => await apiClient.inventory.adjustments.approve(organizationId!, inventoryId, adjustmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['inventory-adjustments', organizationId, inventoryId],
      });
    },
  });
};

export const useRestockInventory = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<InventoryAdjustment>, Error, Partial<InventoryAdjustment>>({
    mutationFn: async data => await apiClient.inventory.restock(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['inventory', organizationId],
      });
      queryClient.invalidateQueries({ queryKey: ['products', organizationId] });
    },
  }); 
};