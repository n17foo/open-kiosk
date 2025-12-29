import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { KioskService, PlatformConfig } from '../services/interfaces';
import { serviceFactory } from '../services/ServiceFactory';

interface PlatformContextValue {
  service: KioskService | null;
  config: PlatformConfig | null;
  isLoading: boolean;
  error: string | null;
  initializePlatform: (config: PlatformConfig) => Promise<void>;
  switchPlatform: (config: PlatformConfig) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [service, setService] = useState<KioskService | null>(null);
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePlatform = async (platformConfig: PlatformConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      const newService = await serviceFactory.createService(platformConfig);
      await newService.initialize();

      setService(newService);
      setConfig(platformConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize platform';
      setError(errorMessage);
      console.error('Platform initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchPlatform = async (platformConfig: PlatformConfig) => {
    // Dispose current service if exists
    if (service) {
      try {
        await service.dispose();
      } catch (err) {
        console.warn('Error disposing current service:', err);
      }
    }

    await initializePlatform(platformConfig);
  };

  const resetToDefault = async () => {
    const defaultConfig = serviceFactory.getDefaultConfig();
    await switchPlatform(defaultConfig);
  };

  // Initialize with default platform on mount
  useEffect(() => {
    const initDefault = async () => {
      const defaultConfig = serviceFactory.getDefaultConfig();
      await initializePlatform(defaultConfig);
    };

    void initDefault();
  }, []);

  const value = useMemo<PlatformContextValue>(
    () => ({
      service,
      config,
      isLoading,
      error,
      initializePlatform,
      switchPlatform,
      resetToDefault,
    }),
    [service, config, isLoading, error],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
