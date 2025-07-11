import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, adminApi, AdminLoginData } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AdminContextType {
  admin: AdminUser | null;
  token: string | null;
  login: (data: AdminLoginData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminUser');

    try {
      if (storedToken) setToken(storedToken);
      if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    } catch (err) {
      console.error('Failed to parse stored admin', err);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setToken(null);
      setAdmin(null);
    }

    setIsLoading(false);
  }, []);

  const login = async (data: AdminLoginData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminApi.login(data);

      const access = response.access;
      
      // Store token in localStorage
      localStorage.setItem('adminToken', access);
      setToken(access);

      // Store admin data
      setAdmin(response.admin);
      localStorage.setItem('adminUser', JSON.stringify(response.admin));

      toast({
        title: 'Admin login successful!',
        description: `Welcome back, ${response.admin.first_name}!`,
      });

      return true;
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast({
        title: 'Admin login failed',
        description: error.message || 'Please check your credentials.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    toast({
      title: 'Admin logged out',
      description: 'You have been logged out of the admin panel.',
    });
  };

  return (
    <AdminContext.Provider value={{ admin, token, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 