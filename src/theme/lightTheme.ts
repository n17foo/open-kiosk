export const lightTheme = {
  colors: {
    primary: '#0353A4',
    onPrimary: '#FFFFFF',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    accent: '#E67E22',
    muted: '#F0F2F5',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#DC2626',
    success: '#16A34A',
    overlay: 'rgba(0,0,0,0.5)',
  },
  radius: {
    md: 12,
    xl: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  typography: {
    base: 18,
    button: 20,
    heading: 32,
    subheading: 24,
  },
};

export type LightTheme = typeof lightTheme;
