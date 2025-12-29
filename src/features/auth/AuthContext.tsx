import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ApiClient, setApiClient, hasApiClient } from '../../api/client';
import { STORAGE_KEYS } from '../../lib/constants';
import { safeJsonParse } from '../../lib/utils';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface StoredCredentials {
  username: string;
  password: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    username: null,
    error: null,
  });

  // Try to restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_CREDENTIALS);
      if (stored) {
        try {
          const decoded = atob(stored);
          const credentials = safeJsonParse<StoredCredentials | null>(decoded, null);
          
          if (credentials) {
            const client = new ApiClient(credentials);
            const isValid = await client.testConnection();
            
            if (isValid) {
              setApiClient(client);
              setState({
                isAuthenticated: true,
                isLoading: false,
                username: credentials.username,
                error: null,
              });
              return;
            }
          }
        } catch (e) {
          // Invalid stored credentials
          localStorage.removeItem(STORAGE_KEYS.AUTH_CREDENTIALS);
        }
      }

      setState({
        isAuthenticated: false,
        isLoading: false,
        username: null,
        error: null,
      });
    };

    restoreSession();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const client = new ApiClient({ username, password });
      const isValid = await client.testConnection();

      if (!isValid) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          username: null,
          error: 'Invalid credentials. Please check your username and password.',
        });
        return false;
      }

      // Store credentials (encoded)
      const credentials = JSON.stringify({ username, password });
      localStorage.setItem(STORAGE_KEYS.AUTH_CREDENTIALS, btoa(credentials));

      setApiClient(client);
      setState({
        isAuthenticated: true,
        isLoading: false,
        username,
        error: null,
      });

      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Connection failed. Please try again.';
      setState({
        isAuthenticated: false,
        isLoading: false,
        username: null,
        error: message,
      });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_CREDENTIALS);
    setApiClient(null);
    setState({
      isAuthenticated: false,
      isLoading: false,
      username: null,
      error: null,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


