import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { Channel, Message } from '@/prisma/client';

// Chat Channels
export const useListChannels = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Channel[]>, Error>({
    queryKey: ['channels', organizationId],
    queryFn: () => apiClient.chat.channels.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Channel>, Error, Partial<Channel>>({
    mutationFn: data => apiClient.chat.channels.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', organizationId] });
    },
  });
};

export const useUpdateChannel = (channelId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Channel>, Error, Partial<Channel>>({
    mutationFn: data => apiClient.chat.channels.update(organizationId!, channelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['channel', organizationId, channelId] });
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: channelId => apiClient.chat.channels.delete(organizationId!, channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', organizationId] });
    },
  });
};

export const useGetChannel = (channelId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Channel>, Error>({
    queryKey: ['channel', organizationId, channelId],
    queryFn: () => apiClient.chat.channels.get(organizationId!, channelId),
    enabled: !!organizationId && !!channelId,
  });
};

// Chat Messages
export const useListMessages = (channelId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Message[]>, Error>({
    queryKey: ['messages', organizationId, channelId],
    queryFn: () => apiClient.chat.messages.list(organizationId!, channelId),
    enabled: !!organizationId && !!channelId,
  });
};

export const useCreateMessage = (channelId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Message>, Error, Partial<Message>>({
    mutationFn: data => apiClient.chat.messages.create(organizationId!, channelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', organizationId, channelId],
      });
    },
  });
};

export const useUpdateMessage = (channelId: string, messageId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Message>, Error, Partial<Message>>({
    mutationFn: data => apiClient.chat.messages.update(organizationId!, channelId, messageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', organizationId, channelId],
      });
    },
  });
};

export const useDeleteMessage = (channelId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: messageId => apiClient.chat.messages.delete(organizationId!, channelId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', organizationId, channelId],
      });
    },
  });
};

export const useGetMessage = (channelId: string, messageId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Message>, Error>({
    queryKey: ['message', organizationId, channelId, messageId],
    queryFn: () => apiClient.chat.messages.get(organizationId!, channelId, messageId),
    enabled: !!organizationId && !!channelId && !!messageId,
  });
};
