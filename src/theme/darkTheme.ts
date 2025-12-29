export const darkTheme = {
  colors: {
    primary: '#0353A4',
    onPrimary: '#FFFFFF',
    background: '#0B0B0C',
    surface: '#1A1A1C',
    surfaceElevated: '#1C1C1F',
    accent: '#FFC107',
    muted: '#2C2C30',
    text: '#FFFFFF',
    textSecondary: '#C7C7CC',
    border: '#2F2F33',
    error: '#FF5252',
    success: '#2ECC71',
    overlay: 'rgba(0,0,0,0.6)',
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

export type DarkTheme = typeof darkTheme;
