import api from './api';

import type {
  Payment,
  PaymentRequest,
  PaymentSummary,
} from '../types/payment';
export const getPayments = async (): Promise<Payment[]> => {
  const response = await api.get<Payment[]>('/payments');
  return response.data;
};
export const getPaymentSummary = async (): Promise<PaymentSummary[]> => {
  const response = await api.get<PaymentSummary[]>('/payments/summary');
  return response.data;
};

export const getPayment = async (id: number): Promise<Payment> => {
  const response = await api.get<Payment>(`/payments/${id}`);
  return response.data;
};

export const getPaymentsByMemberContribution = async (
  memberContributionId: number
): Promise<Payment[]> => {
  const response = await api.get<Payment[]>(
    `/payments/member-contribution/${memberContributionId}`
  );

  return response.data;
};

export const getTotalPaid = async (
  memberContributionId: number
): Promise<number> => {
  const response = await api.get<number>(
    `/payments/member-contribution/${memberContributionId}/total`
  );

  return response.data;
};

export const getRemainingAmount = async (
  memberContributionId: number
): Promise<number> => {
  const response = await api.get<number>(
    `/payments/member-contribution/${memberContributionId}/remaining`
  );

  return response.data;
};

export const createPayment = async (
  data: PaymentRequest
): Promise<Payment> => {
  const response = await api.post<Payment>('/payments', {
    memberContribution: {
      id: data.memberContributionId,
    },
    amount: data.amount,
    paymentDate: data.paymentDate,
  });

  return response.data;
};

export const updatePayment = async (
  id: number,
  data: {
    amount: number;
    paymentDate: string;
  }
): Promise<Payment> => {
  const response = await api.put<Payment>(
    `/payments/${id}`,
    data
  );

  return response.data;
};

export const deletePayment = async (id: number): Promise<void> => {
  await api.delete(`/payments/${id}`);
};