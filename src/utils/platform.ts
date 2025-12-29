import { Platform } from 'react-native';

/**
 * Utility functions for platform detection
 */

/**
 * Checks if the app is running in an Electron environment
 * @returns boolean - true if running in Electron
 */
export const isElectron = (): boolean => {
  if (Platform.OS !== 'web') return false;
  
  // Check if we're in a browser context and if the userAgent includes Electron
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    return navigator.userAgent.includes('Electron');
  }
  
  return false;
};

/**
 * Checks if the app is running in a web browser (not Electron)
 * @returns boolean - true if running in web browser
 */
export const isWebBrowser = (): boolean => {
  return Platform.OS === 'web' && !isElectron();
};

/**
 * Get the current platform as a string
 * @returns string - 'ios', 'android', 'web', or 'electron'
 */
export const getCurrentPlatform = (): string => {
  if (isElectron()) return 'electron';
  return Platform.OS;
};
