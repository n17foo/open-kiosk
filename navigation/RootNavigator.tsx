import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import { useOnboarding } from '../contexts/OnboardingProvider';
import { View, ActivityIndicator } from 'react-native';

import MainNavigator from './MainNavigator';

// Lazy-loaded screens
const OnboardingScreen = React.lazy(() => import('../screens/onboarding/OnboardingScreen'));

const Stack = createStackNavigator<RootStackParamList>();

const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

const RootNavigator: React.FC = () => {
  const { isOnboarded, isLoading: onboardingLoading } = useOnboarding();

  if (onboardingLoading) {
    return <LoadingFallback />;
  }

  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </React.Suspense>
  );
};

export default RootNavigator;
