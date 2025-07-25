import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  parentId?: string | null;
  totalValue: number;
  createdAt: string;
  isActive?: boolean;
  requiresApproval?: boolean;
  code?: string;
  defaultBudget?: number;
}


export interface GeneratedCategory {
  name: string;
  description: string;
  code: string;
  color: string;
  defaultBudget: number;
}

// Categories
export const useListCategories = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['categories', organizationId],
    queryFn: async () => await apiClient.categories.list(organizationId!),
    enabled: !!organizationId,
  });
  return { data: data?.data || [], isLoading, error, refetch };
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Category>, Error, Partial<Category>>({
    mutationFn: async data => await apiClient.categories.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', organizationId] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Category>, Error, Partial<Category>>({
    mutationFn: async data => await apiClient.categories.update(organizationId!, data.id!, data),
    onSuccess: data => {
      console.log(data)
      queryClient.invalidateQueries({ queryKey: ['categories', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['category', organizationId, data?.data?.id] });
      toast.success('Category updated successfully');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async categoryId => await apiClient.categories.delete(organizationId!, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', organizationId] });
    },
  });
};

export const useGetCategory = (categoryId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Category>, Error>({
    queryKey: ['category', organizationId, categoryId],
    queryFn: async () => await apiClient.categories.get(organizationId!, categoryId),
    enabled: !!organizationId && !!categoryId,
  });
};

export const useGenerateAICategories = () => {
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation({
    mutationFn: async (aiDescription: string) =>
      await apiClient.categories.generateAICategories(organizationId!, aiDescription),
  });
};

// Hook for saving generated categories
export const useSaveGeneratedCategories = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Category[]>, Error, GeneratedCategory[]>({
    mutationFn: async (generatedCategories: GeneratedCategory[]) =>
      await apiClient.categories.saveGeneratedCategories(organizationId!, generatedCategories),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', organizationId] });
    },
  });
};