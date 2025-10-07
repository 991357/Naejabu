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
  login: (token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  changeNickname: (newNickname: string) => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const currentToken = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`,
    };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    router.push('/login');
  }, [router, setUser, setToken]);

  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      logout();
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.status === 401) {
        logout();
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
      logout();
    }
  }, [logout, setUser, setToken]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      fetchUser();
    } else {
      setUser(null); // Ensure user is null if no token
    }
  }, [fetchUser]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    fetchUser();
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
        logout();
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change nickname');
      }

      const data = await response.json();

      // If a new token is issued, update it
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }

      // Manually update user state to reflect nickname change instantly
      if (user) {
        setUser({ ...user, nickname: newNickname });
      }

    } catch (error) {
      console.error('Error changing nickname:', error);
      throw error; // Re-throw to be caught in the component
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchUser, changeNickname }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};