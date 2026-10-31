import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  studentId?: string;
  department?: string;
  batch?: string;
  semester?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('companion_token');
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('companion_token', token);
        setUser(userData);
        setLoading(false);
        return userData;
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (data: any): Promise<User> => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', data);
      if (res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('companion_token', token);
        setUser(userData);
        setLoading(false);
        return userData;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('companion_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
