import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: { phone_or_email: string; password: string }) => Promise<AuthResponse>;
  signup: (data: { phone: string; first_name: string; last_name: string; email: string; password: string }) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  // Only parse if savedUser and token are not null, empty, or "undefined"
  if (
    savedUser &&
    token &&
    savedUser !== "undefined" &&
    token !== "undefined"
  ) {
    setUser(JSON.parse(savedUser));
  }
}, []);
  // React Query mutations using axios
  const signupMutation = useMutation({
    mutationFn: async (data: { phone: string; first_name: string; last_name: string; email: string; password: string }) => {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, data);
      return res.data;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { phone_or_email: string; password: string }) => {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
      return res.data;
    },
  });

  const signup = async (data: { phone: string; first_name: string; last_name: string; email: string; password: string }): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const result = await signupMutation.mutateAsync(data);
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('token', result.token);
      return { success: true, user: result.user, token: result.token };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: { phone_or_email: string; password: string }): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync(data);
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('token', result.token);
      return { success: true, user: result.user, token: result.token };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};