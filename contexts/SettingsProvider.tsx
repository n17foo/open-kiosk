import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { keyValueRepository } from '../repositories/KeyValueRepository';
import { LoggerFactory } from '../services/logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SettingsProvider');

export interface PosConfig {
  storeName: string;
  currency: string;
  taxRate: number;
  taxInclusive: boolean;
  receiptHeader: string;
  receiptFooter: string;
}

const DEFAULT_POS_CONFIG: PosConfig = {
  storeName: 'OpenKiosk',
  currency: 'GBP',
  taxRate: 0.2,
  taxInclusive: true,
  receiptHeader: '',
  receiptFooter: '',
};

interface SettingsContextType {
  posConfig: PosConfig;
  isLoading: boolean;
  updatePosConfig: (updates: Partial<PosConfig>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  posConfig: DEFAULT_POS_CONFIG,
  isLoading: true,
  updatePosConfig: async () => {},
  resetToDefaults: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posConfig, setPosConfig] = useState<PosConfig>(DEFAULT_POS_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await keyValueRepository.getObject<PosConfig>('posConfig');
        if (saved) {
          setPosConfig({ ...DEFAULT_POS_CONFIG, ...saved });
        }
      } catch (err) {
        logger.error({ message: 'Failed to load settings' }, err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    void loadSettings();
  }, []);

  const updatePosConfig = useCallback(
    async (updates: Partial<PosConfig>) => {
      const newConfig = { ...posConfig, ...updates };
      await keyValueRepository.setObject('posConfig', newConfig);
      setPosConfig(newConfig);
      logger.info('POS config updated');
    },
    [posConfig]
  );

  const resetToDefaults = useCallback(async () => {
    await keyValueRepository.setObject('posConfig', DEFAULT_POS_CONFIG);
    setPosConfig(DEFAULT_POS_CONFIG);
    logger.info('Settings reset to defaults');
  }, []);

  const value = useMemo(
    () => ({
      posConfig,
      isLoading,
      updatePosConfig,
      resetToDefaults,
    }),
    [posConfig, isLoading, updatePosConfig, resetToDefaults]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
