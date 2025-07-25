import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../axios';
import { $Enums, Member, MemberRole } from '@/prisma/client';
import { apiClient, useOrgStore } from '../tanstack-axios';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  organizationId: string;
  inviterId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateInviteData {
  email: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
  organizationId: string;
}

export function useInvitations() {
  return useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const res = await api.get("/invitations");
      if (!res.data) throw new Error("Failed to fetch invitations");
      const data = await res.data;
      return data.invitations as Invitation[];
    },
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInviteData) => {
      const res = await api.post("/invitations", data);
      if (!res.data) {
        const error = await res.data?.error || "Failed to create invitation";
        throw new Error(error);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation sent successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to send invitation", {
        description: error.message,
      });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await api.delete(`/invitations/${invitationId}`);
      if (!res.data) throw new Error("Failed to cancel invitation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation cancelled");
    },
    onError: () => {
      toast.error("Failed to cancel invitation");
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await api.patch(`/invitations/${invitationId}`);
      if (!res.data) throw new Error("Failed to resend invitation");
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation resent successfully");
    },
    onError: () => {
      toast.error("Failed to resend invitation");
    },
  })
}

// types/invite.ts
export interface InviteMemberPayload {
  memberId: string;
  channelId: string;
}

export interface ChannelMember {
  id: string;
  memberId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuestInvitePayload {
  channelId: string;
  guestEmail: string;
  expiresInHours?: number;
}

export interface CreateGuestInviteResponse {
  inviteLink: string;
}

export interface ApiError {
  error: string;
}


export function useInviteMember(): UseMutationResult<
  ChannelMember,
  ApiError,
  InviteMemberPayload
> {
  return useMutation({
    mutationFn: async (payload: InviteMemberPayload) => {
      const response = await api.post<ChannelMember>('/channel/invite', payload);
      return response.data;
    },
    //eslint-disable-next-line
    onError: (error: any) => {
      console.error('Error inviting member:', error.response?.data?.error || error.message);
    },
  });
}

export function useCreateGuestInvite(): UseMutationResult<
  CreateGuestInviteResponse,
  ApiError,
  CreateGuestInvitePayload
> {
  return useMutation({
    mutationFn: async (payload: CreateGuestInvitePayload) => {
      console.log(payload)
      const response = await api.post<CreateGuestInviteResponse>(
        '/channels/guest-invite',
        payload
      );
      const data = response.data;
      console.log(data)
      return data

    },
    //eslint-disable-next-line
    onError: (error: any) => {
      console.error('Error creating guest invite:', error.response?.data?.error || error.message);
    },
  });
}


// == CREATE INVITATION ==

interface CreateInvitePayload {
          inviteeEmail: string;
          role: MemberRole;
        }

export const useCreateOrgInvitation = () => {
  const queryClient = useQueryClient();

  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation({
    mutationFn: async (data: CreateInvitePayload) => await apiClient.organization.invitations.create(organizationId!, data),
    onSuccess: () => {
      toast.success('Invitation sent successfully!');
      // Invalidate queries related to members or invitations to refetch data
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to send invitation.';
      toast.error(errorMessage);
    },
  });
};

// == ACCEPT INVITATION ==
const acceptInvitationFn = async (token: string) => {
  const { data } = await api.post<Member>(`/invitations/org/${token}/accept`);
  return data;
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvitationFn,
    onSuccess: (data) => {
      toast.success("Invitation accepted! Welcome to the team.");
      // When an invitation is accepted, you might want to refetch user/auth data
      // as their active organization or roles may have changed.
      queryClient.invalidateQueries({ queryKey: ['auth-context'] });
      queryClient.invalidateQueries({ queryKey: ['organization', data.organizationId] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to accept the invitation.";
      toast.error(errorMessage);
    }
  });
};

// == DECLINE INVITATION ==
const declineInvitationFn = async (token: string) => {
  const { data } = await api.post(`/invitations/org/${token}/decline`);
  return data;
};

export const useDeclineInvitation = () => {
  return useMutation({
    mutationFn: declineInvitationFn,
    onSuccess: () => {
      toast.info("Invitation has been declined.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "An error occurred while declining the invitation.";
      toast.error(errorMessage);
    }
  });
};