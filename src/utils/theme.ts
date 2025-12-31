// Global theme configuration for OpenKiosk application

// Colors
export const colors = {
  // Primary colors
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#64B5F6',
  
  // Secondary colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',
  
  // Accent colors
  accent: '#4CAF50',
  accentDark: '#388E3C',
  accentLight: '#81C784',
  
  // Grey scale
  black: '#000000',
  darkGrey: '#212121',
  grey: '#9E9E9E',
  lightGrey: '#E0E0E0',
  white: '#FFFFFF',
  
  // Background colors
  background: {
    primary: '#F5F5F5',
    secondary: '#FFFFFF',
    tertiary: '#ECEFF1',
  },
  
  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E',
    white: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
  },
  
  // Status colors
  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFEB3B',
    info: '#2196F3',
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 34,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 34,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 28,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    subtitle1: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    body1: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
    },
    overline: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 14,
      textTransform: 'uppercase',
    },
  },

  // Border colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#9E9E9E',
  },
};

// Typography
export const typography = {
  fontFamily: {
    primary: 'System',  // Default system font - will use San Francisco on iOS and Roboto on Android
    secondary: 'System',
  },
  fontSize: {
    tiny: 10,
    small: 12,
    regular: 14,
    medium: 16,
    large: 18,
    xLarge: 20,
    xxLarge: 24,
    xxxLarge: 28,
    huge: 32,
  },
  fontWeight: {
    thin: '300' as '300',
    regular: 'normal' as 'normal',
    medium: '500' as '500',
    bold: 'bold' as 'bold',
    heavy: '900' as '900',
  },
  lineHeight: {
    small: 1.2,
    medium: 1.5,
    large: 1.8,
  },
};

// Spacing
export const spacing = {
  tiny: 4,
  small: 8,
  regular: 12,
  medium: 16,
  large: 24,
  xLarge: 32,
  xxLarge: 40,
  xxxLarge: 48,
};

// Borders
export const borders = {
  radius: {
    small: 4,
    medium: 8,
    large: 12,
    circle: 9999,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
};

// Shadows
export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  xLarge: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

// Layout
export const layout = {
  screenPadding: spacing.medium,
  contentWidth: '100%',
  maxContentWidth: 1200,
};

// Animation configs
export const animations = {
  timing: {
    short: 200,
    medium: 300,
    long: 500,
  },
};

// Z-Index
export const zIndex = {
  background: -1,
  base: 0,
  content: 1,
  navigation: 10,
  modal: 100,
  toast: 1000,
};

// Export all theme components as a single object
const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  layout,
  animations,
  zIndex,
};

export default theme;
