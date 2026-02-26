import { useState, useEffect, useCallback } from 'react';
import { keyValueRepository } from '../repositories/KeyValueRepository';
import { useLogger } from './useLogger';

interface ScannerSettings {
  enabled: boolean;
  cameraPosition: 'front' | 'back';
  vibrationOnScan: boolean;
  soundOnScan: boolean;
  scanDebounceMs: number;
}

const DEFAULT_SCANNER_SETTINGS: ScannerSettings = {
  enabled: false,
  cameraPosition: 'back',
  vibrationOnScan: true,
  soundOnScan: true,
  scanDebounceMs: 500,
};

const SCANNER_SETTINGS_KEY = 'scannerSettings';

export function useScannerSettings() {
  const logger = useLogger('useScannerSettings');
  const [settings, setSettings] = useState<ScannerSettings>(DEFAULT_SCANNER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await keyValueRepository.getObject<ScannerSettings>(SCANNER_SETTINGS_KEY);
        if (saved) {
          setSettings({ ...DEFAULT_SCANNER_SETTINGS, ...saved });
        }
      } catch (err) {
        logger.error({ message: 'Failed to load scanner settings' }, err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [logger]);

  const updateSettings = useCallback(
    async (updates: Partial<ScannerSettings>) => {
      const newSettings = { ...settings, ...updates };
      await keyValueRepository.setObject(SCANNER_SETTINGS_KEY, newSettings);
      setSettings(newSettings);
      logger.info('Scanner settings updated');
    },
    [settings, logger]
  );

  const resetSettings = useCallback(async () => {
    await keyValueRepository.setObject(SCANNER_SETTINGS_KEY, DEFAULT_SCANNER_SETTINGS);
    setSettings(DEFAULT_SCANNER_SETTINGS);
    logger.info('Scanner settings reset');
  }, [logger]);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
}
