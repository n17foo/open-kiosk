import React, { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { KioskFlowParamList } from '../navigation/types';

const IDLE_TIMEOUT_MS = 90_000;

const EXEMPT_ROUTES = new Set(['Attract', 'PlatformSetup']);

function getActiveRouteName(state: Parameters<Parameters<typeof useNavigationState>[0]>[0]): string | null {
  if (!state) return null;
  const route = state.routes[state.index ?? state.routes.length - 1];
  if (!route) return null;
  if (route.state) return getActiveRouteName(route.state as Parameters<typeof getActiveRouteName>[0]);
  return route.name;
}

const IdleTimer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation<StackNavigationProp<KioskFlowParamList>>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentRoute = useNavigationState(state => getActiveRouteName(state));

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (currentRoute && EXEMPT_ROUTES.has(currentRoute)) return;
    timerRef.current = setTimeout(() => {
      navigation.navigate('Attract');
    }, IDLE_TIMEOUT_MS);
  }, [navigation, currentRoute]);

  // Restart timer whenever the active route changes
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        resetTimer();
        return false;
      }}
      onMoveShouldSetResponderCapture={() => {
        resetTimer();
        return false;
      }}
    >
      {children}
    </View>
  );
};

export default IdleTimer;
