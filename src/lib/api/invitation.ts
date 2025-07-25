import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { Invitation, MemberRole } from '@/prisma/client';

// Invitations
export const useListInvitations = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Invitation[]>, Error>({
    queryKey: ['invitations', organizationId],
    queryFn: () => apiClient.invitations.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Invitation>, Error, { email: string; role: MemberRole; channelId?: string }>({
    mutationFn: data => apiClient.invitations.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', organizationId] });
    },
  });
};

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: invitationId => apiClient.invitations.delete(organizationId!, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', organizationId] });
    },
  });
};
