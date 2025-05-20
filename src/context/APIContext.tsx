'use client';

import { createContext, useContext, useCallback } from 'react';
import { api, API_ROUTES } from '@/lib/client/axios';
import type { APIResponse } from '@/lib/client/axios';
import type { MonkeyUser } from '@/lib/supabase/user';
import { hashPassword } from '@/lib/server/auth';
import { setTokens } from '@/lib/client/indexeddb';

import { useAuth } from '@/context/AuthContext';

// Types for API operations
interface LoginParams {
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: MonkeyUser;
}

interface APIContextType {
  // Auth operations
  login: (params: LoginParams) => Promise<APIResponse<AuthResponse> | undefined>;
  register: (params: LoginParams) => Promise<APIResponse<AuthResponse> | undefined>;
  logout: () => Promise<void>;
  
  // User operations
  chat: (params: unknown) => Promise<APIResponse<unknown>>;
  upload: (params: unknown) => Promise<APIResponse<unknown>>;
  
  // Add other API operations as needed
}

const APIContext = createContext<APIContextType | null>(null);

export default function APIProvider({ children }: { children: React.ReactNode }) {
  
  const { setIsLoggedIn } = useAuth();

  // Auth operations
  const login = useCallback(async (params: LoginParams) => {

    const hashedPassword = hashPassword(params.password);

    try {
      const response = await api.post<APIResponse<AuthResponse>>(
        API_ROUTES.AUTH.LOGIN,
        { username: params.username, password: hashedPassword }
      );
      setIsLoggedIn(true);
      const data = response.data;
      await setTokens(
        params.username,
        // @ts-ignore
        data.accessToken,
        // @ts-ignore
        data.refreshToken,
      );
      return data;
    } catch (error) {
      console.error('login', error);
    }
  }, []);

  const register = useCallback(async (params: LoginParams) => {

    const hashedPassword = hashPassword(params.password);

    try {
      const response = await api.post<APIResponse<AuthResponse>>(
        API_ROUTES.AUTH.REGISTER,
        { username: params.username, password: hashedPassword }
      );
      const data = response.data;
      setIsLoggedIn(true);
      return response.data;
    } catch (error) {
      console.error('register', error);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post(API_ROUTES.AUTH.LOGOUT);
  }, []);

  const chat = useCallback(async (params: unknown) => {
    const response = await api.post<APIResponse<unknown>>(
      API_ROUTES.MONKEY.CHAT,
      params
    );
    return response.data;
  }, []);

  const upload = useCallback(async (params: unknown) => {
    const response = await api.post<APIResponse<unknown>>(
      API_ROUTES.MONKEY.UPLOAD,
      params
    );
    return response.data;
  }, []);

  const value: APIContextType = {
    login,
    register,
    logout,
    chat,
    upload,
  };

  return (
    <APIContext.Provider value={value}>
      {children}
    </APIContext.Provider>
  );
}

export function useAPI() {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
}
