import api from './api';
import type {
  Contribution,
  ContributionRequest,
} from '../types/contribution';
import type { ContributionStatistics } from '../types/contribution';
export const getContributions = async (): Promise<Contribution[]> => {
  const response = await api.get<Contribution[]>('/contributions');
  return response.data;
};

export const getContribution = async (
  id: number
): Promise<Contribution> => {
  const response = await api.get<Contribution>(
    `/contributions/${id}`
  );
  return response.data;
};

export const createContribution = async (
  data: ContributionRequest
): Promise<Contribution> => {
  const response = await api.post<Contribution>(
    '/contributions',
    data
  );
  return response.data;
};

export const updateContribution = async (
  id: number,
  data: ContributionRequest
): Promise<Contribution> => {
  const response = await api.put<Contribution>(
    `/contributions/${id}`,
    data
  );
  return response.data;
};

export const deleteContribution = async (
  id: number
): Promise<void> => {
  await api.delete(`/contributions/${id}`);
};

export const getContributionStatistics = async (
  contributionId: number
): Promise<ContributionStatistics> => {
  const response = await api.get(
    `/contributions/${contributionId}/statistics`
  );

  return response.data;
};