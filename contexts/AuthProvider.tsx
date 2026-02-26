import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { authService } from '../services/auth/AuthService';
import { auditLogService } from '../services/audit/AuditLogService';
import { AuthMethodType, AuthResult } from '../services/auth/AuthMethodInterface';
import { LoggerFactory } from '../services/logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('AuthProvider');

interface AuthUser {
  userId: string;
  userName: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authenticate: (method: AuthMethodType, credential?: string) => Promise<AuthResult>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  authenticate: async () => ({ success: false, error: 'No provider' }),
  logout: () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthConfig = async () => {
      try {
        await authService.loadConfig();
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        logger.error({ message: 'Failed to load auth config' }, err instanceof Error ? err : new Error(String(err)));
      }
    };
    void loadAuthConfig();
  }, []);

  const authenticate = useCallback(async (method: AuthMethodType, credential?: string): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.authenticate(method, credential);

      if (result.success) {
        const authUser: AuthUser = {
          userId: result.userId ?? '',
          userName: result.userName ?? '',
          role: result.role ?? 'cashier',
        };
        setUser(authUser);
        void auditLogService.log('auth:login', {
          userId: authUser.userId,
          userName: authUser.userName,
          details: `Login via ${method}`,
        });
      } else {
        setError(result.error ?? 'Authentication failed');
        void auditLogService.log('auth:failed', {
          details: `Failed ${method} auth: ${result.error}`,
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication error';
      setError(errorMessage);
      logger.error({ message: 'Authentication error' }, err instanceof Error ? err : new Error(String(err)));
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const currentUser = authService.getCurrentUser();
    authService.logout();
    setUser(null);
    setError(null);
    if (currentUser) {
      void auditLogService.log('auth:logout', {
        userId: currentUser.userId,
        userName: currentUser.userName,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = user !== null;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      authenticate,
      logout,
      clearError,
    }),
    [user, isAuthenticated, isLoading, error, authenticate, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
