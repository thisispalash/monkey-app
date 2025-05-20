import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import { getTokens, setTokens } from '@/lib/client/indexeddb';

// API Endpoints
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  MONKEY: {
    CHAT: '/monkey/chat',
    UPLOAD: '/monkey/upload',
  },
} as const;

// Types for API responses
export interface APIResponse<T> {
  data: T;
  error?: string;
}

// Create base axios instance
const baseConfig: AxiosRequestConfig = {
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create and configure axios instance
const axiosInstance: AxiosInstance = axios.create(baseConfig);

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const tokens = await getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 and token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = await getTokens();
        if (!tokens?.refreshToken) throw new Error('No refresh token');

        // Try to refresh the token
        const response = await axiosInstance.post(API_ROUTES.AUTH.REFRESH, {
          refreshToken: tokens.refreshToken,
        });

        const { accessToken, refreshToken, expiresAt } = response.data;
        
        // Store new tokens
        await setTokens(
          tokens.username,
          accessToken,
          refreshToken,
          expiresAt
        );

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure (e.g., redirect to login)
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export configured instance
export const api = axiosInstance;
