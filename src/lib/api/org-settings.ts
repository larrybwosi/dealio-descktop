import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { OrganizationSettings } from '@/prisma/client';

// Organization Settings
export const useOrganizationSettings = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<OrganizationSettings>, Error>({
    queryKey: ['organization-settings', organizationId],
    queryFn: () => apiClient.organization.getSettings(organizationId!),
    enabled: !!organizationId,
  });
};

export const useUpdateOrganizationSettings = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<OrganizationSettings>, Error, Partial<OrganizationSettings>>({
    mutationFn: data => apiClient.organization.updateSettings(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-settings', organizationId],
      });
    },
  });
};
