import api from './api';
import type { Expense, ExpenseRequest } from '../types/expense';

export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get<Expense[]>('/expenses');
  return response.data;
};

export const getExpense = async (id: number): Promise<Expense> => {
  const response = await api.get<Expense>(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (
  data: ExpenseRequest
): Promise<Expense> => {
  const response = await api.post<Expense>('/expenses', data);
  return response.data;
};

export const updateExpense = async (
  id: number,
  data: ExpenseRequest
): Promise<Expense> => {
  const response = await api.put<Expense>(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};

export const getTotalExpense = async (): Promise<number> => {
  const response = await api.get<number>('/expenses/total');
  return response.data;
};