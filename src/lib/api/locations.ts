import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { InventoryLocation } from '@/prisma/client';
import { Location } from '@/app/api/_utils/memory';

// Locations
export const useListLocations = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, isLoading, error}= useQuery<ApiResponse<InventoryLocation[]>, Error>({
    queryKey: ['locations', organizationId],
    queryFn: () => apiClient.locations.list(organizationId!),
    enabled: !!organizationId,
  });
  
  return { data:data?.warehouses || [], isLoading, error}
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<InventoryLocation>, Error, Partial<InventoryLocation>>({
    mutationFn: data => apiClient.locations.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', organizationId] });
    },
  });
};

export const useUpdateLocation = (locationId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<InventoryLocation>, Error, Partial<InventoryLocation>>({
    mutationFn: data => apiClient.locations.update(organizationId!, locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['location', organizationId, locationId] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: locationId => apiClient.locations.delete(organizationId!, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', organizationId] });
    },
  });
};

export const useGetLocation = (locationId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, isLoading, error, refetch} = useQuery<ApiResponse<Location>, Error>({
    queryKey: ['location', organizationId, locationId],
    queryFn: () => apiClient.locations.get(organizationId!, locationId),
    enabled: !!organizationId && !!locationId,
  });
  return{ data:data?.data || [], isLoading, refetch, error}
};
