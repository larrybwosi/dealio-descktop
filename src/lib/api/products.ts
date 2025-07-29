import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { Product, ProductVariant } from '@/prisma/client';
import axios from 'axios';

// Products
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

interface CachedData {
  data: any[];
  timestamp: number;
}

// In-memory cache for demonstration (replace with localStorage in your environment)
const cache = new Map<string, CachedData>();

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

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Product>, Error, Partial<Product>>({
    mutationFn: async data => await apiClient.products.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', organizationId] });
    },
  });
};

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Product>, Error, Partial<Product>>({
    mutationFn: async data => await apiClient.products.update(organizationId!, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['product', organizationId, productId] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async productId => await apiClient.products.delete(organizationId!, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', organizationId] });
    },
  });
};

export const useGetProduct = (productId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, refetch, error } = useQuery<ApiResponse<Product>, Error>({
    queryKey: ['product', organizationId, productId],
    queryFn: async () => await apiClient.products.get(organizationId!, productId),
    enabled: !!organizationId && !!productId,
  });
  
  return {
    data: data?.product || null,
    locations: data?.locations || [],
    isLoading: !data,
    isError: !data && !!organizationId && !!productId,
    error,
    refetch
  };
};

// Product Variants
export const useListProductVariants = (productId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, refetch, error } = useQuery<ApiResponse<ProductVariant[]>, Error>({
    queryKey: ['product-variants', organizationId, productId],
    queryFn: async () => await apiClient.products.variants.list(organizationId!, productId),
    enabled: !!organizationId && !!productId,
  });
  return {
    data: data?.data || [],
    isLoading: !data,
    isError: !data && !!organizationId && !!productId,
    error,
    refetch
  };
};

export const useCreateProductVariant = (productId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<ProductVariant>, Error, Partial<ProductVariant>>({
    mutationFn: async data => await apiClient.products.variants.create(organizationId!, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', organizationId, productId] });
    },
  });
};

export const useUpdateProductVariant = (productId: string, variantId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<ProductVariant>, Error, Partial<ProductVariant>>({
    mutationFn: async data => await apiClient.products.variants.update(organizationId!, productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', organizationId, productId] });
      queryClient.invalidateQueries({ queryKey: ['product-variant', organizationId, productId, variantId] });
    },
  });
};

export const useDeleteProductVariant = (productId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async variantId => await apiClient.products.variants.delete(organizationId!, productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', organizationId, productId] });
    },
  });
};

export const useGetProductVariant = (productId: string, variantId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<ProductVariant>, Error>({
    queryKey: ['product-variant', organizationId, productId, variantId],
    queryFn: async () => await apiClient.products.variants.get(organizationId!, productId, variantId),
    enabled: !!organizationId && !!productId && !!variantId,
  });
};
