import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse, useOrgStore } from "../tanstack-axios";
import { Customer } from "@/types";
import { toast } from "sonner";

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

interface CachedData {
  data: any[];
  timestamp: number;
}

export const useListCustomers = () => {
  const organizationId = useOrgStore(state => state.organizationId);

  // Generate cache key based on organizationId
  const cacheKey = `customers_${organizationId}`;

  // Function to get cached data
  const getCachedData = (): CachedData | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          return parsed;
        }
        // Remove expired cache
        localStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.error('Error reading cache:', error);
      localStorage.removeItem(cacheKey);
    }
    return null;
  };

  // Function to set cached data
  const setCachedData = (data: any[]) => {
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  // Function to manually invalidate cache
  const invalidateCache = () => {
    try {
      localStorage.removeItem(cacheKey);
      console.log(`Cache invalidated for key: ${cacheKey}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  };

  // Function to invalidate all customer caches for the organization
  const invalidateAllCustomerCaches = () => {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`customers_${organizationId}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      console.log(`Invalidated ${keysToRemove.length} customer caches for organization ${organizationId}`);
    } catch (error) {
      console.error('Error invalidating all caches:', error);
    }
  };

  const { data, refetch, error, isLoading } = useQuery({
    queryKey: ['customers', organizationId],
    queryFn: async () => {
      // First check cache
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('Using cached data for:', cacheKey);
        return { data: cachedData.data };
      }

      // console.log('Fetching fresh data for:', cacheKey);
      const response = await apiClient.customers.list(organizationId!);
      // Cache the new data
      setCachedData(response.data);
      return { data: response.data };
    },
    enabled: !!organizationId,
    initialData: (() => {
      const cachedData = getCachedData();
      return cachedData ? { data: cachedData.data } : undefined;
    })(),
    // Prevent refetch on window focus if we have cached data
    refetchOnWindowFocus: false,
    // Set stale time to match cache duration
    staleTime: CACHE_DURATION,
  });

  // Enhanced refetch that also clears cache
  const refetchWithCacheClear = async () => {
    invalidateCache();
    const res = await refetch();
    toast.success('Customers updated')
    return res
  };

  return {
    data: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    refetch: refetchWithCacheClear,
    // Cache management functions
    invalidateCache,
    invalidateAllCustomerCaches,
    // Utility to check if data is from cache
    isCached: !!getCachedData(),
    // Get cache timestamp
    cacheTimestamp: getCachedData()?.timestamp || null,
  };
};


export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);
  const { invalidateCache } = useListCustomers(); // Get the cache invalidation function

  return useMutation<ApiResponse<Customer>, Error, Partial<Customer>>({
    mutationFn: data => apiClient.customers.create(organizationId!, data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['customers', organizationId] });
      invalidateCache();
      toast.success(`Customer "${response.data.name}" created successfully`);
    },
    onError: error => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });
};

export const useUpdateCustomer = (customerId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Customer>, Error, Partial<Customer>>({
    mutationFn: data => apiClient.customers.update(organizationId!, customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['customer', organizationId, customerId] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation({
    mutationFn: customerId => apiClient.customers.delete(organizationId!, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', organizationId] });
    },
  });
};
