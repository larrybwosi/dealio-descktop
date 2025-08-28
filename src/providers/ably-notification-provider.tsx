'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import * as Ably from 'ably';
import { X, Check, CheckCheck, Bell, AlertCircle, ShoppingCart, Info } from 'lucide-react';
import { useOrgStore } from '@/lib/tanstack-axios';
import { ably } from '@/lib/ably';
import { cn } from '@/lib/utils';
import { fetch } from '@tauri-apps/plugin-http';
import { API_ENDPOINT } from '@/lib/axios';

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

// Custom Toast Component
interface CustomToastProps {
  notification: ClientNotification;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  isVisible: boolean;
}

const CustomToast = ({ notification, onClose, onMarkAsRead, isVisible }: CustomToastProps) => {
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
        'transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-full opacity-0 scale-95'
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
};

// Toast Container
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    notification: ClientNotification;
    timestamp: number;
  }>;
  onRemoveToast: (id: string) => void;
  onMarkAsRead: (notificationId: string) => void;
}

const ToastContainer = ({ toasts, onRemoveToast, onMarkAsRead }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast, index) => (
        <CustomToast
          key={toast.id}
          notification={toast.notification}
          onClose={() => onRemoveToast(toast.id)}
          onMarkAsRead={onMarkAsRead}
          isVisible={true}
        />
      ))}
    </div>
  );
};

// Create the context
interface NotificationContextType {
  notifications: ClientNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  showToast: (notification: ClientNotification) => void;
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
      timestamp: number;
    }>
  >([]);

  const { organizationId, locationId } = useOrgStore();
  const ablyClient = useRef<Ably.Realtime | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((type: string) => {
    let sound: NotificationSound = 'default';
    if (type === 'NEW_ORDER') sound = 'new-order';
    if (type === 'SYSTEM_ALERT') sound = 'system-alert';

    if (audioRef.current) {
      audioRef.current.src = soundMap[sound];
      audioRef.current.play().catch(error => console.error('Audio play failed:', error));
    }
  }, []);

  const showToast = useCallback((notification: ClientNotification) => {
    const toastId = `toast-${notification.id}-${Date.now()}`;
    const newToast = {
      id: toastId,
      notification,
      timestamp: Date.now(),
    };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // Keep max 5 toasts

    // Auto remove toast after 8 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 8000);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  useEffect(() => {
    // Initialize the audio element
    audioRef.current = new Audio();

    const initializeAbly = async () => {
      ably.connection.on('connected', () => {
        console.log('Ably connected!');
      });

      const orgChannel = ably.channels.get(`organization:${organizationId}`);

      orgChannel.subscribe('new-notification', message => {
        const newNotification = message.data as ClientNotification;

        // Update state
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show custom toast
        showToast(newNotification);

        // Play sound
        playSound(newNotification.type);
      });

      if (locationId) {
        const locationChannel = ably.channels.get(`location:${locationId}`);
        locationChannel.subscribe('new-notification', message => {
          const newNotification = message.data as ClientNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          showToast(newNotification);
          playSound(newNotification.type);
        });
      }
    };

    initializeAbly();

    return () => {
      ablyClient.current?.connection.close();
    };
  }, [organizationId, locationId, playSound, showToast]);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_ENDPOINT}/api/organizations/${organizationId}/notifications`);
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: ClientNotification) => !n.isRead).length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (organizationId) {
      fetchNotifications();
    }
  }, [organizationId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/api/organizations/${organizationId}/notifications/${notificationId}/read`, {
        method: 'PATCH'});

      if (response.ok) {
        setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Update toast as well
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
  };

  const markAllAsRead = async () => {
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
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        showToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} onMarkAsRead={markAsRead} />
    </NotificationContext.Provider>
  );
};
