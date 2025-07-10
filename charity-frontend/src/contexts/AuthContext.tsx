import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, apiService, LoginData, SignupData } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginData) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    try {
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('Failed to parse stored user', err);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  const login = async (data: LoginData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(data);

      const access = response.access;
      setToken(access);

      const decoded = jwtDecode<{ username: string }>(access);

      const user: User = {
        id: 0, // Use real ID if available in backend
        username: decoded.username,
        full_name: decoded.username, // Optional, adjust as needed
      };

      setUser(user);

      localStorage.setItem('authToken', access);
      localStorage.setItem('authUser', JSON.stringify(user));

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.username}`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.detail || 'Please check your credentials.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      setIsLoading(true);
      await apiService.signup(data);
      return await login({ username: data.username, password: data.password });
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.response?.data?.detail || 'Please try again with different info.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');

    toast({
      title: 'Logged out',
      description: 'Thank you for making a difference!',
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
