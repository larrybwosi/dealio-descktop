// src/hooks/useNetworkStatus.ts
import { useOfflineSalesStore } from '@/store/sales';
import { useEffect, useState } from 'react';
import { syncPendingSales } from '../services/sales';
import { toast } from 'sonner';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const pendingSalesCount = useOfflineSalesStore(state => state.pendingSales.length);

  useEffect(() => {
    const handleOnline = async () => {
      console.log('Application is online.');
      setIsOnline(true);
      toast.info('You are back online. Attempting to sync pending sales...');
      if (pendingSalesCount > 0) {
        try {
          const { successfulSyncs, failedSyncs } = await syncPendingSales();
          if (failedSyncs > 0) {
            toast.error(`${failedSyncs} sales could not be synced. Please check their status.`);
          } else if (successfulSyncs > 0) {
            toast.success(`${successfulSyncs} pending sales synced successfully!`);
          }
        } catch (error) {
          console.error('Error during automatic sync:', error);
          toast.error("An unexpected error occurred during sale synchronization.");
        }
      }
    };

    const handleOffline = () => {
      console.log('Application is offline.');
      setIsOnline(false);
      // toast.warn('You are currently offline. Sales will be queued and synced when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check and sync if online and there are pending sales
    if (navigator.onLine && pendingSalesCount > 0) {
      console.log('Initial check: Online and pending sales exist. Triggering sync.');
      syncPendingSales()
        .then(({ successfulSyncs, failedSyncs }) => {
          if (failedSyncs > 0) {
            toast.info(`${failedSyncs} sales could not be synced automatically on load. Please check their status.`);
          } else if (successfulSyncs > 0) {
            toast.success(`${successfulSyncs} pending sales synced successfully on load!`);
          }
        })
        .catch(error => {
          console.error('Error during initial sync:', error);
          toast.error("An unexpected error occurred during initial sale synchronization.");
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSalesCount]); // Rerun effect if pendingSalesCount changes, to allow manual trigger to also work with this.

  return isOnline;
};

// You can then use this hook in your main App component or a layout component:
// src/App.tsx or src/components/Layout.tsx
// import { useNetworkStatus } from '@/hooks/useNetworkStatus';
//
// function App() {
//   useNetworkStatus(); // Initialize network status listener and auto-sync logic
//   // ... rest of your app
//   return ( /* ... JSX ... */ );
// }
