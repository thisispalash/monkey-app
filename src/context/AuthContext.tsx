'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { MonkeyUser } from '@/lib/supabase/user';
import { getTokens, getUser } from '@/lib/client/indexeddb';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  user: Partial<MonkeyUser> | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthContextProvider({ children }: { children: React.ReactNode }) {

  const router = useRouter();

  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  const [ user, setUser ] = useState<MonkeyUser | null>(null);

  // const getAccessToken = async () => {
  //   const tokens = await getTokens();

  //   if (!tokens) return null;

  //   const { accessToken } = tokens;

  //   return accessToken;
  // }

  // const getRefreshToken = async () => {
  //   const tokens = await getTokens();

  //   if (!tokens) return null;

  //   const { refreshToken } = tokens;

  //   return refreshToken;
  // }

  useEffect(() => {

    const checkAuth = async () => {
      const tokens = await getTokens();

      if (!tokens) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      const user = await getUser(tokens.username) as MonkeyUser;
      
      setIsLoggedIn(true);
      setUser(user);
      router.push('/home');
    }

    checkAuth();

  }, [router]);



  return (
    <AuthContext.Provider 
      value={{ isLoggedIn, setIsLoggedIn, user }}>
        {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthContextProvider');
  return context;
}