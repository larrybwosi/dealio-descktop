import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { Product, ProductVariant } from '@/prisma/client';

// Products
export const useListProducts = (inLocation: boolean = false) => {
  const organizationId = useOrgStore(state => state.organizationId);
  const locationId = useOrgStore(state => state.locationId); 
  const { data, refetch, error } = useQuery({
    queryKey: ['products', organizationId, inLocation ? locationId : undefined],
    queryFn: async () => await apiClient.products.list(organizationId!, inLocation ? locationId! : undefined),
    enabled: !!organizationId,
  });
  return {
    data: data || [],
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
