import { useQuery } from "@tanstack/react-query";
import { apiClient, useOrgStore } from "../tanstack-axios";

// Products
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

interface CachedData {
  //eslint-disable-next-line
  data: any[];
  timestamp: number;
}


export const useListProducts = (inLocation: boolean = true) => {
  const organizationId = useOrgStore(state => state.organizationId);
  const locationId = useOrgStore(state => state.locationId);

  // Generate cache key based on organizationId and locationId
  const cacheKey = `products_${organizationId}_${inLocation ? locationId : 'no-location'}`;

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
  //eslint-disable-next-line
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

  // Function to invalidate all product caches for the organization
  const invalidateAllProductCaches = () => {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`products_${organizationId}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      console.log(`Invalidated ${keysToRemove.length} product caches for organization ${organizationId}`);
    } catch (error) {
      console.error('Error invalidating all caches:', error);
    }
  };

  const { data, refetch, error, isLoading } = useQuery({
    queryKey: ['products', organizationId, inLocation ? locationId : 'no-location'],
    queryFn: async () => {
      // First check cache
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('Using cached data for:', cacheKey);
        return { data: cachedData.data };
      }

      // console.log('Fetching fresh data for:', cacheKey);
      const response = await apiClient.products.list(organizationId!, inLocation ? locationId! : undefined);
      console.log(response);
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
    return await refetch();
  };

  return {
    data: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    refetch: refetchWithCacheClear,
    // Cache management functions
    invalidateCache,
    invalidateAllProductCaches,
    // Utility to check if data is from cache
    isCached: !!getCachedData(),
    // Get cache timestamp
    cacheTimestamp: getCachedData()?.timestamp || null,
  };
};