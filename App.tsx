import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18n from './locales/i18n';
import { LoggerFactory } from './services/logger/LoggerFactory';

// Navigation
import RootNavigator from './navigation/RootNavigator';

// Legacy context providers (kept for backward compat)
import { AppProvider } from './context/AppContext';
import { PlatformProvider } from './context/PlatformContext';
import { CatalogProvider } from './context/CatalogContext';
import { BasketProvider } from './context/BasketContext';

// New architecture providers
import ErrorBoundary from './components/ui/ErrorBoundary';
import { DataProvider } from './contexts/DataProvider';
import { NotificationProvider } from './contexts/NotificationProvider';
import { OnboardingProvider } from './contexts/OnboardingProvider';
import { AuthProvider } from './contexts/AuthProvider';
import { SettingsProvider } from './contexts/SettingsProvider';

const logger = LoggerFactory.getInstance().createLogger('App');

const appStyles = StyleSheet.create({
  root: { flex: 1 },
});

export default function App() {
  useEffect(() => {
    const isElectron = Platform.OS === 'web' && navigator.userAgent.includes('Electron');
    if (isElectron) {
      logger.info('Running in Electron environment');
    }
  }, []);

  return (
    <GestureHandlerRootView style={appStyles.root}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <I18nextProvider i18n={i18n}>
            <DataProvider>
              <NotificationProvider>
                <AppProvider>
                  <PlatformProvider>
                    <OnboardingProvider>
                      <AuthProvider>
                        <SettingsProvider>
                          <CatalogProvider>
                            <BasketProvider>
                              <NavigationContainer>
                                <RootNavigator />
                                <StatusBar style="dark" />
                              </NavigationContainer>
                            </BasketProvider>
                          </CatalogProvider>
                        </SettingsProvider>
                      </AuthProvider>
                    </OnboardingProvider>
                  </PlatformProvider>
                </AppProvider>
              </NotificationProvider>
            </DataProvider>
          </I18nextProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
