import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

const get = (url, params) => api.get(url, { params }).then((r) => r.data);

// ---- reads -------------------------------------------------------------

export const useSummary = (month) =>
  useQuery({ queryKey: ['summary', month], queryFn: () => get('/summary', { month }) });

export const useTransactions = (params) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn: () => get('/transactions', params),
    placeholderData: (prev) => prev, // keep the table filled while the next page loads
  });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => get('/categories'), staleTime: 5 * 60_000 });

export const useBudgets = (month) =>
  useQuery({ queryKey: ['budgets', month], queryFn: () => get('/budgets', { month }) });

export const useRecurring = () => useQuery({ queryKey: ['recurring'], queryFn: () => get('/recurring') });

export async function fetchAllTransactions(params) {
  return (await get('/transactions', { ...params, all: 'true' })).items;
}

// ---- writes ------------------------------------------------------------

// Any change to money data can affect the dashboard, budgets and lists, so refresh them together.
const MONEY_KEYS = ['transactions', 'summary', 'budgets', 'recurring'];

function useMoneyMutation(fn, extraKeys = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => [...MONEY_KEYS, ...extraKeys].forEach((key) => qc.invalidateQueries({ queryKey: [key] })),
  });
}

export const useSaveTransaction = () =>
  useMoneyMutation(({ id, ...body }) => (id ? api.put(`/transactions/${id}`, body) : api.post('/transactions', body)));

export const useDeleteTransaction = () => useMoneyMutation((id) => api.delete(`/transactions/${id}`));

export const useImportTransactions = () => useMoneyMutation((rows) => api.post('/transactions/import', { rows }).then((r) => r.data));

export const useSaveBudget = () => useMoneyMutation((body) => api.put('/budgets', body));
export const useDeleteBudget = () => useMoneyMutation((id) => api.delete(`/budgets/${id}`));

export const useSaveRecurring = () =>
  useMoneyMutation(({ id, ...body }) => (id ? api.put(`/recurring/${id}`, body) : api.post('/recurring', body)));
export const useDeleteRecurring = () => useMoneyMutation((id) => api.delete(`/recurring/${id}`));

export const useSaveCategory = () =>
  useMoneyMutation(({ id, ...body }) => (id ? api.put(`/categories/${id}`, body) : api.post('/categories', body)), ['categories']);
export const useDeleteCategory = () => useMoneyMutation((id) => api.delete(`/categories/${id}`), ['categories']);
