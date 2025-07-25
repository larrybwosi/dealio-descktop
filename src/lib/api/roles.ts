import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '../tanstack-axios';
import { Member } from '@/prisma/client';
import { Permission } from '../permissions';
import { CustomRole } from '../types/permissions';

// Custom Roles
export const useListCustomRoles = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery({
    queryKey: ['custom-roles', organizationId],
    queryFn: () => apiClient.organization.roles.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateCustomRole = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<CustomRole>, Error, Partial<CustomRole>>({
    mutationFn: data => apiClient.organization.roles.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-roles', organizationId] });
    },
  });
};

export const useUpdateCustomRole = (roleId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<CustomRole>, Error, Partial<CustomRole>>({
    mutationFn: data => apiClient.organization.roles.update(organizationId!, roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-roles', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['custom-role', organizationId, roleId] });
    },
  });
};

export const useDeleteCustomRole = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: roleId => apiClient.organization.roles.delete(organizationId!, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-roles', organizationId] });
    },
  });
};

export const useGetCustomRole = (roleId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<CustomRole>, Error>({
    queryKey: ['custom-role', organizationId, roleId],
    queryFn: () => apiClient.organization.roles.get(organizationId!, roleId),
    enabled: !!organizationId && !!roleId,
  });
};

export const useAssignRoleToMember = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, { memberId: string; roleId: string }>({
    mutationFn: ({ memberId, roleId }) => apiClient.roles.assignToMember(organizationId!, memberId, roleId),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['member', organizationId, memberId] });
      queryClient.invalidateQueries({ queryKey: ['roles', organizationId] });
    },
  });
};

export const useRemoveRoleFromMember = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, { memberId: string; roleId: string }>({
    mutationFn: ({ memberId, roleId }) => apiClient.roles.removeFromMember(organizationId!, memberId, roleId),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['member', organizationId, memberId] });
      queryClient.invalidateQueries({ queryKey: ['roles', organizationId] });
    },
  });
};

export const useListMembersWithRole = (roleId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, refetch, error, isLoading } = useQuery<ApiResponse<Member[]>, Error>({
    queryKey: ['role-members', organizationId, roleId],
    queryFn: () => apiClient.roles.listMembersWithRole(organizationId!, roleId),
    enabled: !!organizationId && !!roleId,
  });

  return {
    data: data?.data || [],
    isLoading,
    isError: !data && !!organizationId,
    error,
    refetch,
  };
};

export const useUpdateRolePermissions = (roleId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<CustomRole>, Error, Permission[]>({
    mutationFn: permissions => apiClient.roles.updatePermissions(organizationId!, roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['role', organizationId, roleId] });
    },
  });
};

export const useToggleRoleStatus = (roleId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<CustomRole>, Error, boolean>({
    mutationFn: isActive => apiClient.roles.toggleActiveStatus(organizationId!, roleId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['role', organizationId, roleId] });
    },
  });
};


export function useAddRoleFromTemplate() {
  const organizationId = useOrgStore(state => state.organizationId);
  return useMutation({
    mutationFn: async (roleTemplateName: string) => await apiClient.roles.addFromTemplate(organizationId!, roleTemplateName),
    mutationKey: ['addRoleFromTemplate'],
  });
}