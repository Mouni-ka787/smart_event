"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  token: string;
  phoneNumber?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: { name: string; email: string; password: string; role: string; phoneNumber?: string }) => Promise<User>;
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
      console.log('AuthContext: Attempting login with:', { email, password });
      const data = await authAPI.login({ email, password });
      console.log('AuthContext: Login API response:', data);
      
      // Check if we received the expected data structure
      if (!data || !data.token) {
        throw new Error('Invalid response from server');
      }
      
      const userWithToken = { ...data, token: data.token };
      
      setUser(userWithToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      console.log('AuthContext: User set successfully:', userWithToken);
      return userWithToken; // Return user data
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      // Re-throw the error with more context
      if (error.message === 'Invalid credentials') {
        throw new Error('The email or password you entered is incorrect. Please check your credentials and try again.');
      }
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role: string; phoneNumber?: string }) => {
    try {
      console.log('AuthContext: Attempting registration with:', userData);
      const data = await authAPI.register(userData);
      console.log('AuthContext: Registration API response:', data);
      const userWithToken = { ...data, token: data.token };
      
      setUser(userWithToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      console.log('AuthContext: User registered and set successfully:', userWithToken);
      return userWithToken; // Return user data
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
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