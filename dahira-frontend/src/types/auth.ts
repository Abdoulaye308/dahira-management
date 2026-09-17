export type Role = 'ADMIN' | 'MEMBER';

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: Role;
}

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  role: Role;
}