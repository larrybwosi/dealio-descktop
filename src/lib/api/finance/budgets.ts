import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { Budget } from '@/prisma/client';

// Finance - Budgets
export const useListBudgets = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Budget[]>, Error>({
    queryKey: ['budgets', organizationId],
    queryFn: () => apiClient.finance.budgets.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Budget>, Error, Partial<Budget>>({
    mutationFn: data => apiClient.finance.budgets.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', organizationId] });
    },
  });
};

export const useUpdateBudget = (budgetId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Budget>, Error, Partial<Budget>>({
    mutationFn: data => apiClient.finance.budgets.update(organizationId!, budgetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['budget', organizationId, budgetId] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: budgetId => apiClient.finance.budgets.delete(organizationId!, budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', organizationId] });
    },
  });
};

export const useGetBudget = (budgetId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Budget>, Error>({
    queryKey: ['budget', organizationId, budgetId],
    queryFn: () => apiClient.finance.budgets.get(organizationId!, budgetId),
    enabled: !!organizationId && !!budgetId,
  });
};