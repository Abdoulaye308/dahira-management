import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  memberId: number | null;
  memberName: string | null;
  enabled: boolean;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const toggleUser = async (id: number): Promise<User> => {
  const response = await api.put<User>(`/users/${id}/toggle`);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};
export interface UserUpdateRequest {
  username: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export const updateUser = async (
  id: number,
  data: UserUpdateRequest
): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, data);
  return response.data;
};