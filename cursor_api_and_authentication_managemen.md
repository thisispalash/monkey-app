# API and Authentication Management with Axios
_Exported on 5/19/2025 at 21:28:18 PDT from Cursor (0.50.5)_

---

**User**

I need help with two things,
- one unified api calling system using axios
- managing authentication.. i need protected routes, sending bearer tokens every request, and storing session keys in indexeddb not cookies.. how should i?

---

**Cursor**

I'll help you set up a comprehensive authentication and API management system. Let's break this down into parts:

1. First, let's create a unified API client using Axios
2. Then, we'll set up authentication management with IndexedDB storage
3. Finally, we'll implement protected routes

Let me first check the project structure to see where we should place these files.

Let me try a different approach to understand the project structure.

Perfect! I see you already have some structure in place. Let me propose a complete solution for your requirements:

1. First, let's create a unified Axios client setup:

```typescript:src/lib/api/http.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken } from './session';

class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          // You might want to redirect to login or refresh token
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  // Add other methods (put, delete, etc.) as needed
}

export const http = HttpClient.getInstance();
```

2. Now, let's create a session management system using IndexedDB:

```typescript:src/lib/api/session.ts
interface AuthSession {
  token: string;
  user: {
    id: string;
    username: string;
    // add other user fields as needed
  };
}

class SessionManager {
  private static DB_NAME = 'monkey-app-db';
  private static STORE_NAME = 'auth';
  private static KEY = 'session';

  private static async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SessionManager.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(SessionManager.STORE_NAME)) {
          db.createObjectStore(SessionManager.STORE_NAME);
        }
      };
    });
  }

  public static async setSession(session: AuthSession): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(session, this.KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public static async getSession(): Promise<AuthSession | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(this.KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  public static async clearSession(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(this.KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const getAuthToken = async (): Promise<string | null> => {
  const session = await SessionManager.getSession();
  return session?.token || null;
};

export const setAuthSession = SessionManager.setSession;
export const getAuthSession = SessionManager.getSession;
export const clearAuthSession = SessionManager.clearSession;
```

3. For protected routes, create a higher-order component:

```typescript:src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthSession } from '@/lib/api/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getAuthSession();
      if (!session) {
        router.push('/auth');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
```

4. Update your auth page to use the new system:

```typescript:src/app/page.tsx
// ... existing code ...

const handleLogin = async () => {
  if (!preCheck()) return;
  setIsSubmitting(true);
  
  try {
    const response = await http.post<AuthSession>('/api/auth/login', {
      username,
      password
    });
    
    await setAuthSession(response);
    window.location.href = '/dashboard'; // or wherever you want to redirect
  } catch (error) {
    setUserMessage('Invalid credentials');
  } finally {
    setIsSubmitting(false);
  }
}

// ... existing code ...
```

5. To use protected routes, wrap your protected pages like this:

```typescript:src/app/dashboard/page.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>
        {/* Your protected dashboard content */}
      </div>
    </ProtectedRoute>
  );
}
```

To implement this system:

1. Install required dependencies:
```bash
npm install axios
```

2. Create the necessary files as shown above.

3. Use the `http` client for all your API calls:
```typescript
// Example usage
const data = await http.get<YourType>('/api/endpoint');
const response = await http.post<YourType>('/api/endpoint', { data });
```

This system provides:
- A singleton Axios instance with automatic token injection
- Automatic handling of 401 unauthorized responses
- Session storage in IndexedDB
- Protected route wrapper for secure pages
- Type safety throughout the system

The authentication flow will:
1. Store tokens and user data in IndexedDB after login
2. Automatically attach Bearer tokens to all requests
3. Redirect to login if the token is invalid or expired
4. Protect routes from unauthorized access

Would you like me to explain any part in more detail or help you implement specific features of this system?

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken } from './session';

class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          // You might want to redirect to login or refresh token
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  // Add other methods (put, delete, etc.) as needed
}

export const http = HttpClient.getInstance();
```

```typescript
interface AuthSession {
  token: string;
  user: {
    id: string;
    username: string;
    // add other user fields as needed
  };
}

class SessionManager {
  private static DB_NAME = 'monkey-app-db';
  private static STORE_NAME = 'auth';
  private static KEY = 'session';

  private static async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SessionManager.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(SessionManager.STORE_NAME)) {
          db.createObjectStore(SessionManager.STORE_NAME);
        }
      };
    });
  }

  public static async setSession(session: AuthSession): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(session, this.KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public static async getSession(): Promise<AuthSession | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(this.KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  public static async clearSession(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(this.KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const getAuthToken = async (): Promise<string | null> => {
  const session = await SessionManager.getSession();
  return session?.token || null;
};

export const setAuthSession = SessionManager.setSession;
export const getAuthSession = SessionManager.getSession;
export const clearAuthSession = SessionManager.clearSession;
```

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthSession } from '@/lib/api/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getAuthSession();
      if (!session) {
        router.push('/auth');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
```

```typescript
// ... existing code ...

const handleLogin = async () => {
  if (!preCheck()) return;
  setIsSubmitting(true);
  
  try {
    const response = await http.post<AuthSession>('/api/auth/login', {
      username,
      password
    });
    
    await setAuthSession(response);
    window.location.href = '/dashboard'; // or wherever you want to redirect
  } catch (error) {
    setUserMessage('Invalid credentials');
  } finally {
    setIsSubmitting(false);
  }
}

// ... existing code ...
```

```typescript
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>
        {/* Your protected dashboard content */}
      </div>
    </ProtectedRoute>
  );
}
```

```shellscript
npm install axios
```

```typescript
// Example usage
const data = await http.get<YourType>('/api/endpoint');
const response = await http.post<YourType>('/api/endpoint', { data });
```

---

**User**

so what i also want to do is store all api routes within axios as well.. that way, it basically becomes a sdk that components can call.. 

also, for the protected routes, should i do context? same question for session management? ie, should i do a AuthContext that can interface with indexeddb and also ensure protected routes?

---

**Cursor**

Yes! Those are excellent suggestions. Let me help you create a more comprehensive SDK-like structure with API routes and implement context-based auth management.

1. First, let's create an API SDK structure using Axios:

```typescript:src/lib/api/endpoints.ts
// Define all API endpoints as constants
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    SETTINGS: '/user/settings',
  },
  // Add other route categories as needed
} as const;
```

```typescript:src/lib/api/types.ts
export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  // other user fields
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Add other types as needed
```

```typescript:src/lib/api/sdk.ts
import { http } from './http';
import { API_ROUTES } from './endpoints';
import type { AuthResponse, LoginRequest, User } from './types';

// Auth SDK
export const authApi = {
  login: (data: LoginRequest) => 
    http.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data),
  
  signup: (data: LoginRequest) => 
    http.post<AuthResponse>(API_ROUTES.AUTH.SIGNUP, data),
  
  logout: () => 
    http.post(API_ROUTES.AUTH.LOGOUT),
  
  refreshToken: () => 
    http.post<AuthResponse>(API_ROUTES.AUTH.REFRESH),
};

// User SDK
export const userApi = {
  getProfile: () => 
    http.get<User>(API_ROUTES.USER.PROFILE),
  
  updateProfile: (data: Partial<User>) => 
    http.put<User>(API_ROUTES.USER.UPDATE, data),
  
  getSettings: () => 
    http.get(API_ROUTES.USER.SETTINGS),
};

// Export all APIs as a unified SDK
export const api = {
  auth: authApi,
  user: userApi,
  // Add other API categories
};
```

2. Now, let's create a comprehensive Auth Context system:

```typescript:src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/sdk';
import { getAuthSession, setAuthSession, clearAuthSession } from '@/lib/api/session';
import type { User } from '@/lib/api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await getAuthSession();
      if (session) {
        setUser(session.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.auth.login({ username, password });
      await setAuthSession(response);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.auth.signup({ username, password });
      await setAuthSession(response);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err) {
      setError('Signup failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      await clearAuthSession();
      setUser(null);
      router.push('/auth');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

3. Create a Protected Route HOC using the Auth Context:

```typescript:src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

4. Update your root layout to include the AuthProvider:

```typescript:src/app/layout.tsx
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

5. Update your auth page to use the context:

```typescript:src/app/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import cn from '@/lib/cn';
import TextInput from '@/component/primitive/TextInput';
import Button from '@/component/primitive/Button';

export default function Auth() {
  const { login, signup, error, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userMessage, setUserMessage] = useState('');

  const preCheck = () => {
    if (!username) {
      setUserMessage('Please enter a username');
      return false;
    }
    if (!password) {
      setUserMessage('Please enter a password');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!preCheck()) return;
    try {
      await login(username, password);
    } catch (err) {
      setUserMessage(error || 'An error occurred');
    }
  };

  const handleSignup = async () => {
    if (!preCheck()) return;
    try {
      await signup(username, password);
    } catch (err) {
      setUserMessage(error || 'An error occurred');
    }
  };

  // ... rest of your component remains the same ...
}
```

Now you can use the API SDK and auth context throughout your application:

```typescript
// In any component:
import { api } from '@/lib/api/sdk';
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();

  const fetchUserData = async () => {
    const profile = await api.user.getProfile();
    // ... do something with profile
  };

  // ... rest of your component
}
```

This setup provides several benefits:
1. Centralized API route management through the SDK
2. Type-safe API calls
3. Global auth state management
4. Protected route handling
5. Automatic token management
6. Consistent error handling

The context-based approach is indeed better because it:
1. Prevents prop drilling
2. Provides a single source of truth for auth state
3. Makes auth-related functionality available throughout the app
4. Handles loading states and errors consistently
5. Makes testing easier through context mocking

Would you like me to explain any part in more detail or help you implement specific features?

```typescript
// Define all API endpoints as constants
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    SETTINGS: '/user/settings',
  },
  // Add other route categories as needed
} as const;
```

```typescript
export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  // other user fields
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Add other types as needed
```

```typescript
import { http } from './http';
import { API_ROUTES } from './endpoints';
import type { AuthResponse, LoginRequest, User } from './types';

// Auth SDK
export const authApi = {
  login: (data: LoginRequest) => 
    http.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data),
  
  signup: (data: LoginRequest) => 
    http.post<AuthResponse>(API_ROUTES.AUTH.SIGNUP, data),
  
  logout: () => 
    http.post(API_ROUTES.AUTH.LOGOUT),
  
  refreshToken: () => 
    http.post<AuthResponse>(API_ROUTES.AUTH.REFRESH),
};

// User SDK
export const userApi = {
  getProfile: () => 
    http.get<User>(API_ROUTES.USER.PROFILE),
  
  updateProfile: (data: Partial<User>) => 
    http.put<User>(API_ROUTES.USER.UPDATE, data),
  
  getSettings: () => 
    http.get(API_ROUTES.USER.SETTINGS),
};

// Export all APIs as a unified SDK
export const api = {
  auth: authApi,
  user: userApi,
  // Add other API categories
};
```

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/sdk';
import { getAuthSession, setAuthSession, clearAuthSession } from '@/lib/api/session';
import type { User } from '@/lib/api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await getAuthSession();
      if (session) {
        setUser(session.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.auth.login({ username, password });
      await setAuthSession(response);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.auth.signup({ username, password });
      await setAuthSession(response);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err) {
      setError('Signup failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      await clearAuthSession();
      setUser(null);
      router.push('/auth');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

```typescript
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import cn from '@/lib/cn';
import TextInput from '@/component/primitive/TextInput';
import Button from '@/component/primitive/Button';

export default function Auth() {
  const { login, signup, error, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userMessage, setUserMessage] = useState('');

  const preCheck = () => {
    if (!username) {
      setUserMessage('Please enter a username');
      return false;
    }
    if (!password) {
      setUserMessage('Please enter a password');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!preCheck()) return;
    try {
      await login(username, password);
    } catch (err) {
      setUserMessage(error || 'An error occurred');
    }
  };

  const handleSignup = async () => {
    if (!preCheck()) return;
    try {
      await signup(username, password);
    } catch (err) {
      setUserMessage(error || 'An error occurred');
    }
  };

  // ... rest of your component remains the same ...
}
```

```typescript
// In any component:
import { api } from '@/lib/api/sdk';
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();

  const fetchUserData = async () => {
    const profile = await api.user.getProfile();
    // ... do something with profile
  };

  // ... rest of your component
}
```

