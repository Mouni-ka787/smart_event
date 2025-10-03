"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role: string; phoneNumber?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        logout();
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login({ email, password });
      const userWithToken = { ...data, token: data.token };
      
      setUser(userWithToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role: string; phoneNumber?: string }) => {
    try {
      const data = await authAPI.register(userData);
      const userWithToken = { ...data, token: data.token };
      
      setUser(userWithToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}