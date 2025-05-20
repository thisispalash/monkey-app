'use client';

import { createContext, useContext, useCallback } from 'react';
import { api, API_ROUTES } from '@/lib/client/axios';
import type { APIResponse } from '@/lib/client/axios';
import type { MonkeyUser } from '@/lib/supabase/user';

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
  login: (params: LoginParams) => Promise<APIResponse<AuthResponse>>;
  signup: (params: LoginParams) => Promise<APIResponse<AuthResponse>>;
  logout: () => Promise<void>;
  
  // User operations
  chat: (params: any) => Promise<APIResponse<any>>;
  upload: (params: any) => Promise<APIResponse<any>>;
  
  // Add other API operations as needed
}

const APIContext = createContext<APIContextType | null>(null);

export default function APIProvider({ children }: { children: React.ReactNode }) {
  // Auth operations
  const login = useCallback(async (params: LoginParams) => {
    const response = await api.post<APIResponse<AuthResponse>>(
      API_ROUTES.AUTH.LOGIN,
      params
    );
    return response.data;
  }, []);

  const signup = useCallback(async (params: LoginParams) => {
    const response = await api.post<APIResponse<AuthResponse>>(
      API_ROUTES.AUTH.SIGNUP,
      params
    );
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    await api.post(API_ROUTES.AUTH.LOGOUT);
  }, []);

  const chat = useCallback(async (params: any) => {
    const response = await api.post<APIResponse<any>>(
      API_ROUTES.MONKEY.CHAT,
      params
    );
    return response.data;
  }, []);

  const upload = useCallback(async (params: any) => {
    const response = await api.post<APIResponse<any>>(
      API_ROUTES.MONKEY.UPLOAD,
      params
    );
    return response.data;
  }, []);

  const value: APIContextType = {
    login,
    signup,
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
