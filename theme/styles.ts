import { StyleSheet } from 'react-native';
import { lightTheme } from './lightTheme';

export const theme = lightTheme;

export type Theme = typeof theme;

export const spacing = (token: keyof Theme['spacing']) => theme.spacing[token];
export const radius = (token: keyof Theme['radius']) => theme.radius[token];
export const typography = (token: keyof Theme['typography']) => theme.typography[token];
export const palette = theme.colors;
export const elevation = {
  card: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export function createStyles<T extends StyleSheet.NamedStyles<T>>(factory: (t: Theme) => T): T {
  return StyleSheet.create(factory(theme));
}
