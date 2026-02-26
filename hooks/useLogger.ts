import { useMemo, useEffect } from 'react';
import { LoggerFactory } from '../services/logger/LoggerFactory';
import { LoggerInterface } from '../services/logger/LoggerInterface';

export const useLogger = (context: string): LoggerInterface => {
  const logger = useMemo(() => LoggerFactory.getInstance().createLogger(context), [context]);

  useEffect(() => {
    if (__DEV__) {
      logger.debug('Component mounted');
      return () => logger.debug('Component unmounted');
    }
  }, [logger]);

  return logger;
};
