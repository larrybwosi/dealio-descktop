import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { Product, ProductVariant } from '@/prisma/client';

// Products


const CACHE_DURATION = 5 * 60 * 1000;

interface CachedData {
  data: any[];
  timestamp: number;
}

export const useListProducts = (inLocation: boolean = false) => {
  const organizationId = useOrgStore(state => state.organizationId);
  const locationId = useOrgStore(state => state.locationId);

  // Generate cache key based on organizationId and locationId
  const cacheKey = `products_${organizationId}_${inLocation ? locationId : 'no-location'}`;

  // Function to get cached data
  const getCachedData = (): CachedData | null => {
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
    return null;
  };

  // Function to set cached data
  const setCachedData = (data: any[]) => {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  };

  const { data, refetch, error } = useQuery({
    queryKey: ['products', organizationId, inLocation ? locationId : undefined],
    queryFn: async () => {
      const cachedData = getCachedData();
      if (cachedData) {
        return { data: cachedData.data };
      }

      const response = await apiClient.products.list(organizationId!, inLocation ? locationId! : undefined);

      // Cache the new data
      setCachedData(response.data);
      return response;
    },
    enabled: !!organizationId,
    // Set initial data from cache if available
    initialData: getCachedData() ? { data: getCachedData()!.data } : undefined,
  });

  return {
    data: data?.data || [],
    isLoading: !data,
    isError: !data && !!organizationId,
    error,
    refetch,
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
