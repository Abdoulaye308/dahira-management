import api from './api';
import type {
  CashSummary,
  CashTransaction,
} from '../types/cash';

export const getCashSummary = async (): Promise<CashSummary> => {
  const response = await api.get<CashSummary>('/cash/summary');
  return response.data;
};

export const getCashTransactions = async (): Promise<CashTransaction[]> => {
  const response = await api.get<CashTransaction[]>(
    '/cash/transactions'
  );
  return response.data;
};