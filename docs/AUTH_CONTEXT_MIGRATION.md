# Replacing LocalStorage/SessionStorage with React Context API for Authentication

## Overview

Managing authentication state using localStorage and sessionStorage has several limitations. Moving to React Context API provides better state management, improved security practices, and easier debugging capabilities.

## Why Replace LocalStorage/SessionStorage?

### Limitations of Browser Storage
1. **Security Risks**: Data in localStorage/sessionStorage can be accessed by any JavaScript code in your app, making it vulnerable to XSS attacks
2. **No Automatic Cleanup**: Tokens remain even after browser crashes or unexpected exits
3. **Memory Consumption**: Persistent storage increases memory usage
4. **Debugging Difficulty**: Hard to track state changes during development
5. **State Consistency**: No centralized state management leading to inconsistencies

### Benefits of Context API
1. **Centralized State Management**: Single source of truth for authentication state
2. **Better Performance**: In-memory state is faster than disk-based storage
3. **Easy Debugging**: Track state changes using React DevTools
4. **Type Safety**: Full TypeScript support for authentication state
5. **Component Communication**: Seamless state passing to child components
6. **Side Effect Management**: Easy integration with useEffect for persistence

## Implementation Strategy

### Step 1: Create Auth Context Interface

First, define the authentication state structure:

```typescript
// types/auth.ts
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  // Add other user properties as needed
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  verifyToken: (token: string) => Promise<boolean>;
  refreshToken: () => Promise<string | null>;
}
```

### Step 2: Create Auth Context Provider

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthState } from '@/types/auth';
import { authService, apiClient } from '@/app/api/client';

// Define action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'VERIFY_TOKEN_SUCCESS'; payload: AuthUser }
  | { type: 'TOKEN_REFRESHED'; payload: { token: string } };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'VERIFY_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        token: action.payload.token,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication state from persisted storage
  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        // Verify the token and restore user session
        const isValid = await verifyToken(storedToken);
        if (isValid) {
          apiClient.setAuthToken(storedToken);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Call the generated API using our client wrapper
      const response = await authService.postAuthLogin({
        requestBody: { email, password },
      });

      // Extract user and token from response
      // Adjust this based on your API response structure
      const { token, user } = response; // Modify according to your API response

      // Save token to localStorage for persistence
      localStorage.setItem('auth_token', token);

      // Set token in API client for subsequent requests
      apiClient.setAuthToken(token);

      // Update context state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('auth_token');

    // Clear token from API client
    apiClient.clearAuthToken();

    // Update context state
    dispatch({ type: 'LOGOUT' });
  };

  // Register function
  const register = async (userData: { email: string; password: string; name: string }) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await authService.postAuthRegister({
        requestBody: userData,
      });

      // Auto-login after registration if desired
      await login(userData.email, userData.password);
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Registration failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Verify token function
  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      // Call an authenticated endpoint to verify the token
      // This could be a profile endpoint or similar
      const response = await apiClient.get('/profile'); // Adjust the endpoint as needed
      if (response) {
        dispatch({
          type: 'VERIFY_TOKEN_SUCCESS',
          payload: response.user, // Adjust according to your API response
        });
        return true;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
    return false;
  };

  // Refresh token function
  const refreshToken = async (): Promise<string | null> => {
    try {
      const response = await authService.getAuthToken(); // Adjust the refresh endpoint
      const newToken = response.token; // Adjust according to your API response

      if (newToken) {
        localStorage.setItem('auth_token', newToken);
        apiClient.setAuthToken(newToken);

        dispatch({
          type: 'TOKEN_REFRESHED',
          payload: { token: newToken },
        });

        return newToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return null;
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    verifyToken,
    refreshToken,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Step 3: Wrap Application with AuthProvider

Update your main application layout to include the AuthProvider:

```typescript
// app/layout.tsx (or where you want to provide auth context)
import { AuthProvider } from '@/contexts/AuthContext';

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

### Step 4: Update Login Form to Use Context

```typescript
// components/auth/login-form.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Redirect after successful login
      router.push('/dashboard');
      router.refresh(); // Optionally refresh to update UI
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Step 5: Protect Routes Using Context

Create a higher-order component or hook for protected routes:

```typescript
// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};
```

And use it in your protected pages:

```typescript
// app/dashboard/page.tsx
'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Or redirect handled by hook
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || user?.email}!</p>
    </div>
  );
}
```

### Step 6: Handle Token Persistence and Security

For enhanced security, consider the following approaches:

```typescript
// utils/auth-storage.ts
export const AuthStorage = {
  // Securely store auth token
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  // Retrieve auth token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Clear auth token
  removeToken() {
    localStorage.removeItem('auth_token');
  },

  // Optional: Store session data separately
  setSession(sessionData: any) {
    sessionStorage.setItem('auth_session', JSON.stringify(sessionData));
  },

  getSession(): any {
    try {
      const session = sessionStorage.getItem('auth_session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  clearSession() {
    sessionStorage.removeItem('auth_session');
  }
};
```

## Migration Steps

1. **Remove Existing Storage Code**: Remove all localStorage and sessionStorage references for authentication
2. **Create AuthContext**: Implement the context provider as shown above
3. **Update Components**: Replace all authentication-related storage access with context values and methods
4. **Test Thoroughly**: Ensure all login, logout, and protected routes work correctly
5. **Handle Edge Cases**: Add proper error handling and loading states

## Security Considerations

While moving to Context API solves many issues, consider these security measures:

1. **Still Store Sensitive Tokens**: Store tokens in localStorage temporarily, but with proper validation
2. **Add Token Expiration**: Implement token expiration checks
3. **Secure HTTP-only Cookies**: Consider using HTTP-only cookies for tokens in production
4. **Monitor for XSS**: Implement proper input sanitization to prevent XSS attacks
5. **Add CSRF Protection**: Implement CSRF tokens for sensitive operations

This migration provides a more robust and maintainable authentication system with better state management and debugging capabilities.