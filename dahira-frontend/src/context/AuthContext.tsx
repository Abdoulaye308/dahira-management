import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import api from '../services/api';
import type {
  AuthResponse,
  AuthUser,
} from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const savedUser =
      localStorage.getItem('user');

    const savedToken =
      localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);

  }, []);

  const login = async (
    email: string,
    password: string
  ) => {

    const response =
      await api.post<AuthResponse>(
        '/auth/login',
        {
          email,
          password,
        }
      );

    const data = response.data;

    const authUser: AuthUser = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      role: data.role,
    };

    localStorage.setItem(
      'token',
      data.token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(authUser)
    );

    setToken(data.token);
    setUser(authUser);
  };

  const logout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth doit être utilisé dans un AuthProvider.'
    );
  }

  return context;
};