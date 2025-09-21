'use client';

import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface User {
  id: number;
  name: string;
  nickname: string;
  is_admin: number;
  role: string;
}

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
