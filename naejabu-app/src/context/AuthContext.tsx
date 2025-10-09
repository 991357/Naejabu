'use client';

import { createContext, useState, ReactNode, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Define the user object structure
interface User {
  id: number;
  name: string;
  nickname: string;
  email: string;
  role: string;
  is_admin: number;
  is_temp_password?: number;
  english_name?: string;
  hanja_name?: string;
  birthdate?: string;
  hobby?: string;
  specialty?: string;
  motto?: string;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  changeNickname: (newNickname: string) => Promise<void>;
  getAuthHeaders: () => HeadersInit;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      sessionStorage.removeItem('token');
      setLoading(false);
      router.push('/login');
    }
  }, [getAuthHeaders, router]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const currentToken = sessionStorage.getItem('token');
    if (!currentToken || currentToken === 'null') {
      if (user || token) {
        await logout();
      }
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.status === 401) {
        await logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData: User = await response.json();
      setUser(userData);
      setToken(currentToken);
    } catch (error) {
      console.error(error);
      await logout();
    } finally {
      setLoading(false);
    }
  }, [logout, user, token]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken && storedToken !== 'null') {
      setToken(storedToken);
      fetchUser();
    } else {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  }, []);

  const login = async (newToken: string) => {
    setLoading(true);
    sessionStorage.setItem('token', newToken);
    setToken(newToken);
    await fetchUser();
    router.push('/');
  };

  const changeNickname = async (newNickname: string) => {
    try {
      const response = await fetch('/api/auth/change-nickname', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nickname: newNickname }),
      });

      if (response.status === 401) {
        await logout();
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change nickname');
      }

      const data = await response.json();

      if (data.token) {
        sessionStorage.setItem('token', data.token);
        setToken(data.token);
      }

      await fetchUser();

    } catch (error) {
      console.error('Error changing nickname:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, fetchUser, changeNickname, getAuthHeaders }}>
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