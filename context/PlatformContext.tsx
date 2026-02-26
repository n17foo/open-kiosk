import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { KioskService, PlatformConfig } from '../services/interfaces';
import { serviceFactory } from '../services/ServiceFactory';
import { LoggerFactory } from '../services/logger/LoggerFactory';
import { keyValueRepository } from '../repositories/KeyValueRepository';
import { PLATFORM_CONFIG_KEY } from '../contexts/OnboardingProvider';

const logger = LoggerFactory.getInstance().createLogger('PlatformProvider');

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

  const initializePlatform = useCallback(async (platformConfig: PlatformConfig) => {
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
      logger.error({ message: 'Platform initialization failed' }, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchPlatform = useCallback(
    async (platformConfig: PlatformConfig) => {
      if (service) {
        try {
          await service.dispose();
        } catch {
          logger.warn('Error disposing current service');
        }
      }
      await initializePlatform(platformConfig);
    },
    [service, initializePlatform]
  );

  const resetToDefault = useCallback(async () => {
    const defaultConfig = serviceFactory.getDefaultConfig();
    await switchPlatform(defaultConfig);
  }, [switchPlatform]);

  // On mount: load saved PlatformConfig from onboarding, fall back to inmemory default
  useEffect(() => {
    const initSaved = async () => {
      const saved = await keyValueRepository.getObject<PlatformConfig>(PLATFORM_CONFIG_KEY);
      const configToUse = saved ?? serviceFactory.getDefaultConfig();
      await initializePlatform(configToUse);
    };

    void initSaved();
  }, [initializePlatform]);

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
    [service, config, isLoading, error, initializePlatform, switchPlatform, resetToDefault]
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
