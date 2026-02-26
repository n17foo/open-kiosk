export type AuthMethodType = 'pin' | 'biometric' | 'password' | 'platform' | 'kiosk_pin';

export type AuthMode = 'online' | 'offline';

export interface AuthMethodInfo {
  label: string;
  description: string;
  icon: string;
}

export interface AuthResult {
  success: boolean;
  userId?: string;
  userName?: string;
  role?: string;
  error?: string;
}

export interface AuthMethodProvider {
  type: AuthMethodType;
  info: AuthMethodInfo;
  isAvailable(): Promise<boolean>;
  authenticate(credential?: string): Promise<AuthResult>;
}

export const AUTH_METHOD_INFO: Record<AuthMethodType, AuthMethodInfo> = {
  pin: {
    label: 'PIN',
    description: 'Enter your numeric PIN to sign in',
    icon: 'keypad',
  },
  biometric: {
    label: 'Biometric',
    description: 'Use fingerprint or face recognition',
    icon: 'finger-print',
  },
  password: {
    label: 'Password',
    description: 'Enter your username and password',
    icon: 'lock-closed',
  },
  platform: {
    label: 'Platform Login',
    description: 'Sign in with your e-commerce platform account',
    icon: 'globe',
  },
  kiosk_pin: {
    label: 'Admin PIN',
    description: 'Enter the kiosk admin PIN for configuration access',
    icon: 'settings',
  },
};

export function getAuthMethodsForMode(mode: AuthMode): AuthMethodType[] {
  if (mode === 'offline') {
    return ['pin', 'biometric', 'password', 'kiosk_pin'];
  }
  return ['platform', 'pin', 'biometric', 'password', 'kiosk_pin'];
}
