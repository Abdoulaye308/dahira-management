import api from './api';
import type { Member, MemberRequest } from '../types/member';

export const getMembers = async (): Promise<Member[]> => {
const response = await api.get<Member[]>('/members');
return response.data;
};

export const getMember = async (id: number): Promise<Member> => {
const response = await api.get<Member>(`/members/${id}`);
return response.data;
};

export const createMember = async (
data: MemberRequest
): Promise<Member> => {
const response = await api.post<Member>('/members', data);
return response.data;
};

export const updateMember = async (
id: number,
data: MemberRequest
): Promise<Member> => {
const response = await api.put<Member>(`/members/${id}`, data);
return response.data;
};

export const deleteMember = async (id: number): Promise<void> => {
await api.delete(`/members/${id}`);
};