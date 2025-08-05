import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient, ApiResponse, useOrgStore } from '../tanstack-axios';

// Types
interface Sale {
  id?: string;
  // Add your sale properties here
}


interface PendingSale {
  id: string;
  data: unknown;
  organizationId: string;
  timestamp: number;
  retryCount: number;
}

const PENDING_SALES_KEY = 'pending_sales';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Utility functions for localStorage operations
const getPendingSales = (): PendingSale[] => {
  try {
    const stored = localStorage.getItem(PENDING_SALES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading pending sales from localStorage:', error);
    return [];
  }
};

const savePendingSale = (sale: PendingSale): void => {
  try {
    const pendingSales = getPendingSales();
    const existingIndex = pendingSales.findIndex(s => s.id === sale.id);

    if (existingIndex >= 0) {
      pendingSales[existingIndex] = sale;
    } else {
      pendingSales.push(sale);
    }

    localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(pendingSales));
  } catch (error) {
    console.error('Error saving pending sale to localStorage:', error);
  }
};

const removePendingSale = (saleId: string): void => {
  try {
    const pendingSales = getPendingSales();
    const filtered = pendingSales.filter(sale => sale.id !== saleId);
    localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending sale from localStorage:', error);
  }
};

const generateSaleId = (): string => {
  return `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Custom hook for retrying pending sales
export const useRetryPendingSales = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  const retryPendingSale = async (pendingSale: PendingSale): Promise<boolean> => {
    try {
      await apiClient.sales.create(pendingSale.organizationId, pendingSale.data);
      removePendingSale(pendingSale.id);
      queryClient.invalidateQueries({ queryKey: ['sales', pendingSale.organizationId] });
      toast.success('Pending sale successfully saved!');
      return true;
    } catch (error: any) {
      const updatedSale: PendingSale = {
        ...pendingSale,
        retryCount: pendingSale.retryCount + 1,
        timestamp: Date.now(),
      };

      if (updatedSale.retryCount >= MAX_RETRY_ATTEMPTS) {
        toast.error('Failed to save pending sale after multiple attempts. Please try again later.');
        // Optionally remove the sale or keep it for manual retry
        removePendingSale(pendingSale.id);
        return false;
      } else {
        savePendingSale(updatedSale);
        toast.warning(`Retry attempt ${updatedSale.retryCount} failed. Will try again later.`);
        return false;
      }
    }
  };

  const retryAllPendingSales = async (): Promise<void> => {
    const pendingSales = getPendingSales();
    const relevantSales = pendingSales.filter(sale => sale.organizationId === organizationId);

    if (relevantSales.length === 0) return;

    toast.info(`Attempting to sync ${relevantSales.length} pending sale(s)...`);

    for (const sale of relevantSales) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      await retryPendingSale(sale);
    }
  };

  // Auto-retry on component mount and when online
  useEffect(() => {
    const handleOnline = () => {
      retryAllPendingSales();
    };

    // Retry when coming back online
    window.addEventListener('online', handleOnline);

    // Initial retry attempt when hook mounts
    if (navigator.onLine && organizationId) {
      setTimeout(retryAllPendingSales, 1000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [organizationId]);

  return {
    retryAllPendingSales,
    getPendingSalesCount: () => getPendingSales().filter(s => s.organizationId === organizationId).length,
  };
};

// Enhanced sale creation hook
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Sale>, Error, unknown>({
    mutationFn: data => apiClient.sales.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', organizationId] });
      toast.success('Sale created successfully!');
    },
    onError: (error: any, variables) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'An unexpected error occurred';

      // Save to localStorage for retry
      const pendingSale: PendingSale = {
        id: generateSaleId(),
        data: variables,
        organizationId: organizationId!,
        timestamp: Date.now(),
        retryCount: 0,
      };

      savePendingSale(pendingSale);

      // Show error with retry information
      toast.error('Failed to create sale', {
        description: `${message}. Sale saved locally and will be retried automatically.`,
        duration: 5000,
      });

      // Still invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['sales', organizationId] });
    },
  });
};

// Optional: Hook to get pending sales count for UI display
export const usePendingSalesCount = () => {
  const organizationId = useOrgStore(state => state.organizationId);

  const getPendingCount = () => {
    return getPendingSales().filter(sale => sale.organizationId === organizationId).length;
  };

  return getPendingCount();
};
