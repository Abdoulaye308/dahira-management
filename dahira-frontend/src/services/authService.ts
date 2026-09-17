import api from './api';

export interface MemberRegisterRequest {
  memberId: number;
  username: string;
  email: string;
  password: string;
}

export const registerMemberAccount = async (
  data: MemberRegisterRequest
) => {
  const response = await api.post('/auth/register-member', data);
  return response.data;
};