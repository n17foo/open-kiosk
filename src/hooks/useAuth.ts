import { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import type { User } from '../services/interfaces';

export const useAuth = () => {
  const { service } = usePlatform();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      const checkAuth = async () => {
        try {
          const currentUser = await service.auth.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Failed to get current user:', err);
        }
      };

      void checkAuth();
    }
  }, [service]);

  const login = async (username: string, password: string) => {
    if (!service) throw new Error('No platform service available');

    setIsLoading(true);
    setError(null);

    try {
      const loggedInUser = await service.auth.login(username, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!service) throw new Error('No platform service available');

    setIsLoading(true);
    setError(null);

    try {
      await service.auth.logout();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = () => {
    return service ? service.auth.isAuthenticated() : false;
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated,
  };
};
