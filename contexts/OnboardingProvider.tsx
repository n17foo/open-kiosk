import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { keyValueRepository } from '../repositories/KeyValueRepository';
import { ECommercePlatform } from '../utils/platforms';
import { LoggerFactory } from '../services/logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('OnboardingProvider');

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  isOnboarded: boolean;
  isLoading: boolean;
  setIsOnboarded: (value: boolean) => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  selectedPlatform: ECommercePlatform | null;
  setSelectedPlatform: (p: ECommercePlatform) => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  currentStep: 0,
  totalSteps: 10,
  isOnboarded: false,
  isLoading: true,
  setIsOnboarded: async () => {},
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
  selectedPlatform: null,
  setSelectedPlatform: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<ECommercePlatform | null>(null);
  const totalSteps = 10;

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

  const setIsOnboarded = useCallback(async (value: boolean) => {
    await keyValueRepository.setItem('isOnboarded', value.toString());
    setIsOnboardedState(value);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
    },
    [totalSteps]
  );

  const value = useMemo(
    () => ({
      currentStep,
      totalSteps,
      isOnboarded,
      isLoading,
      setIsOnboarded,
      nextStep,
      prevStep,
      goToStep,
      selectedPlatform,
      setSelectedPlatform,
    }),
    [currentStep, totalSteps, isOnboarded, isLoading, setIsOnboarded, nextStep, prevStep, goToStep, selectedPlatform]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
