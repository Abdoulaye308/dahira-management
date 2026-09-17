import api from './api';
import type { Income, IncomeRequest } from '../types/income';

export const getIncomes = async (): Promise<Income[]> => {
  const response = await api.get<Income[]>('/incomes');
  return response.data;
};

export const getIncome = async (id: number): Promise<Income> => {
  const response = await api.get<Income>(`/incomes/${id}`);
  return response.data;
};

export const createIncome = async (
  data: IncomeRequest
): Promise<Income> => {
  const response = await api.post<Income>('/incomes', data);
  return response.data;
};

export const updateIncome = async (
  id: number,
  data: IncomeRequest
): Promise<Income> => {
  const response = await api.put<Income>(`/incomes/${id}`, data);
  return response.data;
};

export const deleteIncome = async (id: number): Promise<void> => {
  await api.delete(`/incomes/${id}`);
};

export const getTotalIncome = async (): Promise<number> => {
  const response = await api.get<number>('/incomes/total');
  return response.data;
};