import { Platform } from 'react-native';

export function isElectron(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    return navigator.userAgent.includes('Electron');
  }
  return false;
}

export function isWebBrowser(): boolean {
  return Platform.OS === 'web' && !isElectron();
}

export function isDesktop(): boolean {
  return isElectron();
}

export function isMobileDevice(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function getCurrentPlatformName(): string {
  if (isElectron()) return 'electron';
  return Platform.OS;
}
