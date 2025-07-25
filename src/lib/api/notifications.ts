import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../tanstack-axios';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'member';
  isRead: boolean;
  timestamp: Date;
  link?: {
    url: string;
    text: string;
  };
  priority: 'low' | 'medium' | 'high';
  category: string;
  fromMember?: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    initials: string;
  };
  fullDetails?: string;
  read: boolean;
}

export const useNotifications = (params?: { limit?: number; unreadOnly?: boolean }) => {
  return useQuery<Notification[]>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await apiClient.notifications.list({
        limit: params?.limit,
        // unread: params?.unreadOnly,
      });
      return response.data;
    },
  });
};

export const useMarkAsRead = (params?: { limit?: number; unreadOnly?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return apiClient.notifications.markAsRead(notificationId);
    },
    onMutate: async notificationId => {
      await queryClient.cancelQueries({ queryKey: ['notifications', params] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', params]);

      queryClient.setQueryData<Notification[]>(['notifications', params], old =>
        old?.map(n => (n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n))
      );

      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', params], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', params] });
    },
  });
};

export const useMarkAllAsRead = (params?: { limit?: number; unreadOnly?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.notifications.markAllAsRead();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', params] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', params]);

      queryClient.setQueryData<Notification[]>(['notifications', params], old =>
        old?.map(n => ({ ...n, read: true, readAt: new Date() }))
      );

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', params], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', params] });
    },
  });
};

export const useDeleteNotification = (params?: { limit?: number; unreadOnly?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiClient.notifications.delete(notificationId),
    onMutate: async notificationId => {
      await queryClient.cancelQueries({ queryKey: ['notifications', params] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', params]);

      queryClient.setQueryData<Notification[]>(['notifications', params], old =>
        old?.filter(n => n.id !== notificationId)
      );

      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', params], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', params] });
    },
  });
};

export const useDeleteAllRead = (params?: { limit?: number; unreadOnly?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.notifications.deleteAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', params] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', params]);

      queryClient.setQueryData<Notification[]>(['notifications', params], old => old?.filter(n => !n.read) || []);

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', params], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', params] });
    },
  });
};

export const useDeleteAll = (params?: { limit?: number; unreadOnly?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.notifications.deleteAll(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', params] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', params]);

      queryClient.setQueryData<Notification[]>(['notifications', params], []);

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', params], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', params] });
    },
  });
};

export const useUnreadCount = (notifications?: Notification[]) => {
  return notifications?.filter(n => !n.read).length || 0;
};