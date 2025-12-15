import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../store/hooks';
import { fetchExpenses, createExpense, updateExpenseAPI, deleteExpenseAPI, Expense } from '../services/api';

export const useExpensesQuery = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  // Fetch expenses query
  const {
    data: expenses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: () => fetchExpenses(user!.id, token!),
    enabled: !!user && !!token, // Only run if user and token exist
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: (expenseData: {
      title: string;
      amount: number;
      category: string;
      date: string;
    }) => createExpense({ ...expenseData, userId: user!.id }, token!),
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title: string; amount: number; category: string; date: string };
    }) => updateExpenseAPI(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => deleteExpenseAPI(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
  });

  // Calculate total
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    expenses,
    isLoading,
    isError,
    error,
    refetch,
    totalAmount,
    createExpense: createExpenseMutation.mutateAsync,
    updateExpense: updateExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
  };
};