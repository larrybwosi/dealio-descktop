import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { Assistant, AssistantMessage } from '@/prisma/client';


// Assistants
export const useListAssistants = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Assistant[]>, Error>({
    queryKey: ['assistants', organizationId],
    queryFn: () => apiClient.chat.assistants.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateAssistant = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Assistant>, Error, Partial<Assistant>>({
    mutationFn: data => apiClient.chat.assistants.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistants', organizationId] });
    },
  });
};

export const useUpdateAssistant = (assistantId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Assistant>, Error, Partial<Assistant>>({
    mutationFn: data => apiClient.chat.assistants.update(organizationId!, assistantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistants', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['assistant', organizationId, assistantId] });
    },
  });
};

export const useDeleteAssistant = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: assistantId => apiClient.chat.assistants.delete(organizationId!, assistantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistants', organizationId] });
    },
  });
};

export const useGetAssistant = (assistantId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Assistant>, Error>({
    queryKey: ['assistant', organizationId, assistantId],
    queryFn: () => apiClient.chat.assistants.get(organizationId!, assistantId),
    enabled: !!organizationId && !!assistantId,
  });
};

// Assistant Chats
export const useListAssistantChats = (assistantId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<AssistantMessage[]>, Error>({
    queryKey: ['assistant-chats', organizationId, assistantId],
    queryFn: () => apiClient.chat.assistants.chats.list(organizationId!, assistantId),
    enabled: !!organizationId && !!assistantId,
  });
};

export const useCreateAssistantChat = (assistantId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<AssistantMessage>, Error, Partial<AssistantMessage>>({
    mutationFn: data => apiClient.chat.assistants.chats.create(organizationId!, assistantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assistant-chats', organizationId, assistantId],
      });
    },
  });
};