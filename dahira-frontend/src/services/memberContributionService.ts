import api from './api';
import type {
  MemberContribution,
  MemberContributionRequest,
} from '../types/memberContribution';

export const getByContribution = async (
  contributionId: number
): Promise<MemberContribution[]> => {
  const response = await api.get<MemberContribution[]>(
    `/member-contributions/contribution/${contributionId}`
  );

  return response.data;
};

export const getByMember = async (
  memberId: number
): Promise<MemberContribution[]> => {
  const response = await api.get<MemberContribution[]>(
    `/member-contributions/member/${memberId}`
  );

  return response.data;
};

export const createMemberContribution = async (
  data: MemberContributionRequest
): Promise<MemberContribution> => {
  const response = await api.post<MemberContribution>(
    '/member-contributions',
    data
  );

  return response.data;
};

export const updateMemberContribution = async (
  id: number,
  data: { expectedAmount: number }
): Promise<MemberContribution> => {
  const response = await api.put<MemberContribution>(
    `/member-contributions/${id}`,
    data
  );

  return response.data;
};

export const deleteMemberContribution = async (
  id: number
): Promise<void> => {
  await api.delete(`/member-contributions/${id}`);
};