import { LoggerFactory } from '../logger/LoggerFactory';
import { AuthMethodProvider, AuthMethodType, AuthResult, AuthMode, getAuthMethodsForMode } from './AuthMethodInterface';
import { PinAuthProvider } from './providers/PinAuthProvider';
import { KioskPinAuthProvider } from './providers/KioskPinAuthProvider';
import { keyValueRepository } from '../../repositories/KeyValueRepository';

export interface AuthConfig {
  primaryMethod: AuthMethodType;
  allowedMethods: AuthMethodType[];
  authMode: AuthMode;
}

const DEFAULT_AUTH_CONFIG: AuthConfig = {
  primaryMethod: 'kiosk_pin',
  allowedMethods: ['kiosk_pin', 'pin'],
  authMode: 'offline',
};

export class AuthService {
  private static instance: AuthService;
  private logger = LoggerFactory.getInstance().createLogger('AuthService');
  private providers: Map<AuthMethodType, AuthMethodProvider> = new Map();
  private config: AuthConfig = DEFAULT_AUTH_CONFIG;
  private currentUser: { userId: string; userName: string; role: string } | null = null;

  private constructor() {
    this.registerProvider(new PinAuthProvider());
    this.registerProvider(new KioskPinAuthProvider());
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  registerProvider(provider: AuthMethodProvider): void {
    this.providers.set(provider.type, provider);
    this.logger.info(`Registered auth provider: ${provider.type}`);
  }

  async loadConfig(): Promise<void> {
    const saved = await keyValueRepository.getObject<AuthConfig>('authConfig');
    if (saved) {
      this.config = saved;
    }
  }

  async saveConfig(config: AuthConfig): Promise<void> {
    this.config = config;
    await keyValueRepository.setObject('authConfig', config);
  }

  getConfig(): AuthConfig {
    return { ...this.config };
  }

  getAvailableMethods(): AuthMethodType[] {
    return getAuthMethodsForMode(this.config.authMode).filter(method => this.providers.has(method));
  }

  getAllowedMethods(): AuthMethodType[] {
    return this.config.allowedMethods.filter(method => this.providers.has(method));
  }

  async authenticate(method: AuthMethodType, credential?: string): Promise<AuthResult> {
    const provider = this.providers.get(method);
    if (!provider) {
      this.logger.error({ message: `Auth provider not found: ${method}` });
      return { success: false, error: `Authentication method "${method}" is not available` };
    }

    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      this.logger.warn(`Auth provider not available: ${method}`);
      return { success: false, error: `Authentication method "${method}" is not available on this device` };
    }

    const result = await provider.authenticate(credential);

    if (result.success && result.userId) {
      this.currentUser = {
        userId: result.userId,
        userName: result.userName ?? '',
        role: result.role ?? 'cashier',
      };
    }

    return result;
  }

  getCurrentUser(): { userId: string; userName: string; role: string } | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  logout(): void {
    this.currentUser = null;
    this.logger.info('User logged out');
  }

  reset(): void {
    this.currentUser = null;
    this.config = DEFAULT_AUTH_CONFIG;
  }
}

export const authService = AuthService.getInstance();
