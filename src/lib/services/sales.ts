import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient, ApiResponse, useOrgStore } from '../tanstack-axios';
import { useBusinessConfig } from '@/lib/business-config-manager.ts';

// Types
interface Sale {
  id?: string;
  // Add your sale properties here
}

interface SaleData {
  cartItems: Array<{
    variantId: string;
    quantity: number;
  }>;
  locationId: string;
  customerId?: string | null;
  paymentMethod: string;
  paymentStatus?: string;
  discountAmount?: number;
  cashDrawerId?: string | null;
  notes?: string | null;
  enableStockTracking: boolean;
}

interface PendingSale {
  id: string;
  data: SaleData;
  organizationId: string;
  timestamp: number;
  retryCount: number;
}

interface SyncSalesRequest {
  sales: Array<{
    id: string; // The temporary offline ID
    cartItems: Array<{
      variantId: string;
      quantity: number;
    }>;
    locationId: string;
    customerId?: string | null;
    paymentMethod: string;
    paymentStatus?: string;
    discountAmount?: number;
    cashDrawerId?: string | null;
    notes?: string | null;
    enableStockTracking: boolean;
  }>;
}

interface SyncSalesResponse {
  message: string;
  successfullySynced: string[];
  failedToSync: Array<{
    id: string;
    reason: string;
  }>;
}

const PENDING_SALES_KEY = 'pending_sales';
const MAX_RETRY_ATTEMPTS = 7;
const RETRY_DELAY = 2000; // 2 seconds

// Utility functions for localStorage operations
export const getPendingSales = (): PendingSale[] => {
  try {
    const stored = localStorage.getItem(PENDING_SALES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading pending sales from localStorage:', error);
    return [];
  }
};

export const savePendingSale = (sale: PendingSale): void => {
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

export const removePendingSale = (saleId: string): void => {
  try {
    const pendingSales = getPendingSales();
    const filtered = pendingSales?.filter(sale => sale.id !== saleId);
    localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending sale from localStorage:', error);
  }
};

export const removePendingSales = (saleIds: string[]): void => {
  try {
    const pendingSales = getPendingSales();
    const filtered = pendingSales?.filter(sale => !saleIds.includes(sale.id));
    localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending sales from localStorage:', error);
  }
};

const generateSaleId = (): string => {
  return `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
// Add sync sales function to apiClient (you'll need to add this to your apiClient)
const syncSales = async (organizationId: string, request: SyncSalesRequest): Promise<SyncSalesResponse> => {
  return apiClient.sales.sync(`/organizations/${organizationId}/sales/sync`, request).then(res => res.data);
};

// Custom hook for retrying pending sales
export const useRetryPendingSales = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  const retryAllPendingSales = async (): Promise<void> => {
    const pendingSales = getPendingSales();
    const relevantSales = pendingSales.filter(sale => sale.organizationId === organizationId);

    if (relevantSales.length === 0) return;

    toast.info(`Attempting to sync ${relevantSales.length} pending sale(s)...`);

    try {
      // Prepare the sync request
      const syncRequest: SyncSalesRequest = {
        sales: relevantSales.map(sale => ({
          id: sale.id,
          ...sale.data,
        })),
      };

      // Call the batch sync endpoint
      const response = await syncSales(organizationId!, syncRequest);

      // Handle successful syncs
      if (response.successfullySynced.length > 0) {
        removePendingSales(response.successfullySynced);
        queryClient.invalidateQueries({ queryKey: ['sales', organizationId] });
        toast.success(`Successfully synced ${response.successfullySynced.length} sale(s)!`);
      }

      // Handle failed syncs
      if (response.failedToSync.length > 0) {
        const updatedSales: PendingSale[] = [];
        const salesToRemove: string[] = [];

        response.failedToSync.forEach(failed => {
          const originalSale = relevantSales.find(s => s.id === failed.id);
          if (originalSale) {
            const updatedSale: PendingSale = {
              ...originalSale,
              retryCount: originalSale.retryCount + 1,
              timestamp: Date.now(),
            };

            if (updatedSale.retryCount >= MAX_RETRY_ATTEMPTS) {
              salesToRemove.push(failed.id);
              toast.error(`Failed to sync sale after ${MAX_RETRY_ATTEMPTS} attempts: ${failed.reason}`);
            } else {
              updatedSales.push(updatedSale);
              toast.warning(`Sync failed for sale (attempt ${updatedSale.retryCount}): ${failed.reason}`);
            }
          }
        });

        // Update sales that still have retry attempts left
        updatedSales.forEach(sale => savePendingSale(sale));

        // Remove sales that have exceeded max retry attempts
        if (salesToRemove.length > 0) {
          removePendingSales(salesToRemove);
        }
      }
    } catch (error: any) {
      console.error('Error syncing pending sales:', error);

      // Increment retry count for all sales and handle max retries 3
      const updatedSales: PendingSale[] = [];
      const salesToRemove: string[] = [];

      relevantSales.forEach(sale => {
        const updatedSale: PendingSale = {
          ...sale,
          retryCount: sale.retryCount + 1,
          timestamp: Date.now(),
        };

        if (updatedSale.retryCount >= MAX_RETRY_ATTEMPTS) {
          salesToRemove.push(sale.id);
        } else {
          updatedSales.push(updatedSale);
        }
      });

      // Update sales that still have retry attempts left
      updatedSales.forEach(sale => savePendingSale(sale));

      // Remove sales that have exceeded max retry attempts
      if (salesToRemove.length > 0) {
        removePendingSales(salesToRemove);
        toast.error(`Removed ${salesToRemove.length} sale(s) after ${MAX_RETRY_ATTEMPTS} failed attempts.`);
      }

      if (updatedSales.length > 0) {
        toast.warning(`Sync failed. Will retry ${updatedSales.length} sale(s) later.`);
      }
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
    getPendingSalesCount: () => getPendingSales()?.filter(s => s.organizationId === organizationId).length,
  };
};

// Enhanced sale creation hook
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);
  const config = useBusinessConfig()
  const enableStockTracking = config.config.enableStockTaking;
  // console.log('enableStock: ',enableStockTaking)

  return useMutation<ApiResponse<Sale>, Error, SaleData>({
    mutationFn: data => apiClient.sales.create(organizationId!, { ...data, enableStockTracking }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', organizationId] });
    },
    //eslint-disable-next-line
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
