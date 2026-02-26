import React, { useEffect, useState, ReactNode } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { getDb } from '../utils/db';
import { initializeSchema } from '../utils/dbSchema';
import { LoggerFactory } from '../services/logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('DataProvider');

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        logger.info('Initializing database...');
        const database = getDb();
        await initializeSchema(database);
        logger.info('Database initialized successfully');
        setIsReady(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Database initialization failed';
        logger.error({ message: 'Database initialization failed' }, err instanceof Error ? err : new Error(String(err)));
        setError(message);
      }
    };
    void initDb();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Database Error</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};

const ERROR_COLOR = '#B00020';
const MUTED_COLOR = '#666666';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: ERROR_COLOR,
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: MUTED_COLOR,
    textAlign: 'center',
  },
});
