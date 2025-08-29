'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback, memo } from 'react';
import { X, Check, CheckCheck, Bell, AlertCircle, ShoppingCart, Info } from 'lucide-react';
import { useOrgStore } from '@/lib/tanstack-axios';
import { ably } from '@/lib/ably';
import { cn } from '@/lib/utils';
import { fetch } from '@tauri-apps/plugin-http';
import { API_ENDPOINT } from '@/lib/axios';
import { Realtime } from 'ably';

// Define the shape of a notification for the client
interface ClientNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  isRead?: boolean;
}

// Define the sound map
type NotificationSound = 'default' | 'new-order' | 'system-alert';
const soundMap: Record<NotificationSound, string> = {
  default: '/sounds/notification.mp3',
  'new-order': '/sounds/new-order.mp3',
  'system-alert': '/sounds/alert.mp3',
};

// Custom Toast Component - Memoized to prevent re-renders
interface CustomToastProps {
  notification: ClientNotification;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

const CustomToast = memo(({ notification, onClose, onMarkAsRead }: CustomToastProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'NEW_ORDER':
        return <ShoppingCart className="h-5 w-5 text-green-400" />;
      case 'SYSTEM_ALERT':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'NEW_ORDER':
        return 'border-l-green-400';
      case 'SYSTEM_ALERT':
        return 'border-l-red-400';
      default:
        return 'border-l-blue-400';
    }
  };

  return (
    <div
      className={cn(
        'relative transform transition-all duration-300 ease-in-out',
        'translate-x-0 opacity-100 scale-100'
      )}
    >
      <div
        className={cn(
          'bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-4 max-w-sm w-full border-l-4',
          'backdrop-blur-sm bg-opacity-95',
          getTypeColor()
        )}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-white truncate">{notification.title}</h4>
              <div className="flex items-center space-x-1 ml-2">
                {!notification.isRead && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3 text-gray-400 hover:text-green-400" />
                  </button>
                )}
                <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition-colors" title="Dismiss">
                  <X className="h-3 w-3 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">{notification.body}</p>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleTimeString()}</span>
              {notification.isRead && (
                <div className="flex items-center text-xs text-green-400">
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Read
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CustomToast.displayName = 'CustomToast';

// Toast Container - Memoized to prevent re-renders of the entire container
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    notification: ClientNotification;
  }>;
  onRemoveToast: (id: string) => void;
  onMarkAsRead: (notificationId: string) => void;
}

const ToastContainer = memo(({ toasts, onRemoveToast, onMarkAsRead }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <CustomToast
          key={toast.id}
          notification={toast.notification}
          onClose={() => onRemoveToast(toast.id)}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';

// Create the context
interface NotificationContextType {
  notifications: ClientNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  // showToast is no longer exposed via context as it's an internal implementation detail
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// The Provider component
interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      notification: ClientNotification;
    }>
  >([]);

  const { organizationId, locationId } = useOrgStore();
  const ablyClient = useRef<Realtime | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMounted = useRef(false);

  // Initialize Ably client and channels in a single effect
  useEffect(() => {
    isMounted.current = true;
    audioRef.current = new Audio();

    const orgChannel = ably.channels.get(`organization:${organizationId}`);
    const locationChannel = locationId ? ably.channels.get(`location:${locationId}`) : null;

    //eslint-disable-next-line
    const handleNewNotification = (message: any) => {
      const newNotification = message.data as ClientNotification;

      // Use functional state updates to avoid stale closures
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show custom toast and play sound
      const toastId = `toast-${newNotification.id}-${Date.now()}`;
      const newToast = { id: toastId, notification: newNotification };

      setToasts(prev => [newToast, ...prev.slice(0, 4)]);

      // Auto-remove toast after 8 seconds
      setTimeout(() => {
        if (isMounted.current) {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }
      }, 8000);

      let sound: NotificationSound = 'default';
      if (newNotification.type === 'NEW_ORDER') sound = 'new-order';
      if (newNotification.type === 'SYSTEM_ALERT') sound = 'system-alert';

      if (audioRef.current) {
        audioRef.current.src = soundMap[sound];
        audioRef.current.play().catch(error => console.error('Audio play failed:', error));
      }
    };

    orgChannel.subscribe('new-notification', handleNewNotification);
    if (locationChannel) {
      locationChannel.subscribe('new-notification', handleNewNotification);
    }

    // Ably connection state logging
    //eslint-disable-next-line
    const connectionStateListener = (stateChange: any) => {
      console.log(`Ably connection state: ${stateChange.current}`);
    };
    ably.connection.on(connectionStateListener);

    // Fetch initial notifications
    const fetchNotifications = async () => {
      if (!organizationId) return;
      try {
        const response = await fetch(`${API_ENDPOINT}/api/organizations/${organizationId}/notifications`);
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: ClientNotification) => !n.isRead).length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    return () => {
      // Cleanup function
      isMounted.current = false;
      orgChannel.unsubscribe('new-notification', handleNewNotification);
      if (locationChannel) {
        locationChannel.unsubscribe('new-notification', handleNewNotification);
      }
      ably.connection.off(connectionStateListener);
      // Ably client is typically a singleton, so we don't close it here.
      // If you are using a new client per component, you would close it.
    };
  }, [organizationId, locationId]);

  const removeToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/organizations/${organizationId}/notifications/${notificationId}/read`,
          {
            method: 'PATCH',
          }
        );

        if (response.ok) {
          // Batch state updates to trigger a single re-render
          setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)));
          setUnreadCount(prev => Math.max(0, prev - 1));

          setToasts(prev =>
            prev.map(toast =>
              toast.notification.id === notificationId
                ? { ...toast, notification: { ...toast.notification, isRead: true } }
                : toast
            )
          );
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [organizationId]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}/api/organizations/${organizationId}/notifications/read-all`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [organizationId]);

  const contextValue = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} onMarkAsRead={markAsRead} />
    </NotificationContext.Provider>
  );
};
