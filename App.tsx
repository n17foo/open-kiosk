import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18n from './src/locales/i18n';

// Import Navigation
import MainNavigator from './src/navigation/MainNavigator';
import { AppProvider } from './src/context/AppContext';
import { PlatformProvider } from './src/context/PlatformContext';
import { CatalogProvider } from './src/context/CatalogContext';
import { BasketProvider } from './src/context/BasketContext';

export default function App() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  // Initialize i18n and other services
  useEffect(() => {
    // i18n is already initialized by the time we get here
    setIsI18nReady(true);

    // Platform-specific initialization
    const isElectron = Platform.OS === 'web' && navigator.userAgent.includes('Electron');
    if (isElectron) {
      console.log('Running in Electron environment');
    }
  }, []);

  if (!isI18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <AppProvider>
            <PlatformProvider>
              <CatalogProvider>
                <BasketProvider>
                  <NavigationContainer>
                    <MainNavigator />
                    <StatusBar style="dark" />
                  </NavigationContainer>
                </BasketProvider>
              </CatalogProvider>
            </PlatformProvider>
          </AppProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
