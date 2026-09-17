import api from './api';
import type { MemberContributionSummary } from '../types/member';

export interface MemberPayment {
  paymentId: number;
  contributionId: number;
  contributionName: string;
  expectedAmount: number;
  amountPaid: number;
  remainingAmount: number;
  status: string;
  paymentDate: string;
}

export const getMyContributions = async (): Promise<MemberContributionSummary[]> => {
  const response = await api.get<MemberContributionSummary[]>(
    '/member/contributions'
  );

  return response.data;
};

export const getMyPayments = async (): Promise<MemberPayment[]> => {
  const response = await api.get<MemberPayment[]>(
    '/member/payments'
  );

  return response.data;
};