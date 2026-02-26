import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { keyValueRepository } from '../repositories/KeyValueRepository';
import { ECommercePlatform, isOnlinePlatform } from '../utils/platforms';
import { LoggerFactory } from '../services/logger/LoggerFactory';
import type { PlatformConfig } from '../services/types';

const logger = LoggerFactory.getInstance().createLogger('OnboardingProvider');

// Steps: 0 = Welcome, 1 = Platform pick, 2 = Credentials (online only)
export const ONBOARDING_TOTAL_STEPS = 3;

export const PLATFORM_CONFIG_KEY = 'savedPlatformConfig';

export interface PlatformCredentials {
  baseUrl: string;
  apiKey: string;
}

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  isOnboarded: boolean;
  isLoading: boolean;
  selectedPlatform: ECommercePlatform | null;
  credentials: PlatformCredentials;
  setSelectedPlatform: (p: ECommercePlatform) => void;
  setCredentials: (c: Partial<PlatformCredentials>) => void;
  nextStep: () => void;
  prevStep: () => void;
  complete: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType>({
  currentStep: 0,
  totalSteps: ONBOARDING_TOTAL_STEPS,
  isOnboarded: false,
  isLoading: true,
  selectedPlatform: null,
  credentials: { baseUrl: '', apiKey: '' },
  setSelectedPlatform: () => {},
  setCredentials: () => {},
  nextStep: () => {},
  prevStep: () => {},
  complete: async () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<ECommercePlatform | null>(null);
  const [credentials, setCredentialsState] = useState<PlatformCredentials>({ baseUrl: '', apiKey: '' });

  const totalSteps = ONBOARDING_TOTAL_STEPS;

  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const value = await keyValueRepository.getItem('isOnboarded');
        setIsOnboardedState(value === 'true');
      } catch (err) {
        logger.error({ message: 'Failed to load onboarding state' }, err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    void loadOnboardingState();
  }, []);

  const setCredentials = useCallback((c: Partial<PlatformCredentials>) => {
    setCredentialsState(prev => ({ ...prev, ...c }));
  }, []);

  // Advance — skip credentials step for offline/inmemory platforms
  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1;
      // Step 2 (credentials) is only needed for online platforms
      if (next === 2 && selectedPlatform && !isOnlinePlatform(selectedPlatform)) {
        return next + 1; // skip past credentials
      }
      return Math.min(next, totalSteps - 1);
    });
  }, [selectedPlatform, totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // Build and persist PlatformConfig, then mark onboarded
  const complete = useCallback(async () => {
    try {
      const platform = selectedPlatform ?? ECommercePlatform.OFFLINE;
      const needsCredentials = isOnlinePlatform(platform);

      const config: PlatformConfig = {
        type: needsCredentials ? (platform as PlatformConfig['type']) : 'inmemory',
        name: platform,
        ...(needsCredentials && credentials.baseUrl ? { baseUrl: credentials.baseUrl } : {}),
        ...(needsCredentials && credentials.apiKey ? { apiKey: credentials.apiKey } : {}),
      };

      await keyValueRepository.setObject<PlatformConfig>(PLATFORM_CONFIG_KEY, config);
      await keyValueRepository.setItem('isOnboarded', 'true');
      setIsOnboardedState(true);
      logger.info(`Onboarding complete — platform: ${config.type}`);
    } catch (err) {
      logger.error({ message: 'Failed to complete onboarding' }, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [selectedPlatform, credentials]);

  const value = useMemo(
    () => ({
      currentStep,
      totalSteps,
      isOnboarded,
      isLoading,
      selectedPlatform,
      credentials,
      setSelectedPlatform,
      setCredentials,
      nextStep,
      prevStep,
      complete,
    }),
    [currentStep, totalSteps, isOnboarded, isLoading, selectedPlatform, credentials, setCredentials, nextStep, prevStep, complete]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
