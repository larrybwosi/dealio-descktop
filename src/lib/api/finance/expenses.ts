import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { Expense } from '@/prisma/client';

// Finance - Expenses
export const useListExpenses = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Expense[]>, Error>({
    queryKey: ['expenses', organizationId],
    queryFn: () => apiClient.finance.expenses.list(organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Expense>, Error, Partial<Expense>>({
    mutationFn: data => apiClient.finance.expenses.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', organizationId] });
    },
  });
};

export const useUpdateExpense = (expenseId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Expense>, Error, Partial<Expense>>({
    mutationFn: data => apiClient.finance.expenses.update(organizationId!, expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['expense', organizationId, expenseId] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: expenseId => apiClient.finance.expenses.delete(organizationId!, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', organizationId] });
    },
  });
};

export const useGetExpense = (expenseId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Expense>, Error>({
    queryKey: ['expense', organizationId, expenseId],
    queryFn: () => apiClient.finance.expenses.get(organizationId!, expenseId),
    enabled: !!organizationId && !!expenseId,
  });
};
