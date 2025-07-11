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
      console.log("Received access token:", access);
      
      // Store token in localStorage first
      localStorage.setItem('authToken', access);
      setToken(access);

      // Small delay to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch full user profile including donor name
      console.log("Fetching user profile...");
      const userProfile = await apiService.getMyProfile();
      console.log("User profile received:", userProfile);

      setUser(userProfile);
      localStorage.setItem('authUser', JSON.stringify(userProfile));

      toast({
        title: 'Welcome back!',
        description: `Welcome back, ${userProfile.full_name || userProfile.username}!`,
      });

      return true;
    } catch (error: any) {
      console.error("Login error:", error);
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
