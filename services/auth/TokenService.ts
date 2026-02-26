import { LoggerFactory } from '../logger/LoggerFactory';
import { keyValueRepository } from '../../repositories/KeyValueRepository';

export enum TokenType {
  ACCESS = 'access_token',
  REFRESH = 'refresh_token',
  ID = 'id_token',
  API_KEY = 'api_key',
  SESSION = 'session_token',
}

interface StoredToken {
  token: string;
  expiresAt?: number;
}

type TokenProvider = (platform: string, tokenType: TokenType) => Promise<StoredToken>;

export class TokenService {
  private static instance: TokenService;
  private logger = LoggerFactory.getInstance().createLogger('TokenService');
  private tokenProviders: Map<string, TokenProvider> = new Map();
  private tokenRefreshPromises: Map<string, Promise<StoredToken | null>> = new Map();

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  private getStorageKey(platform: string, tokenType: TokenType): string {
    return `token:${platform}:${tokenType}`;
  }

  registerTokenProvider(platform: string, provider: TokenProvider): void {
    this.tokenProviders.set(platform, provider);
    this.logger.info(`Registered token provider for platform: ${platform}`);
  }

  async setToken(platform: string, tokenType: TokenType, token: string, expiresAt?: number): Promise<void> {
    const key = this.getStorageKey(platform, tokenType);
    await keyValueRepository.setObject<StoredToken>(key, { token, expiresAt });
  }

  async getToken(platform: string, tokenType: TokenType): Promise<string | null> {
    const key = this.getStorageKey(platform, tokenType);
    const stored = await keyValueRepository.getObject<StoredToken>(key);

    if (!stored) return null;

    if (stored.expiresAt && stored.expiresAt < Date.now()) {
      this.logger.info(`Token expired for ${platform}:${tokenType}, attempting refresh`);
      const refreshed = await this.refreshToken(platform, tokenType);
      return refreshed?.token ?? stored.token;
    }

    return stored.token;
  }

  private async refreshToken(platform: string, tokenType: TokenType): Promise<StoredToken | null> {
    const refreshKey = `${platform}:${tokenType}`;

    const existingRefresh = this.tokenRefreshPromises.get(refreshKey);
    if (existingRefresh) {
      return existingRefresh;
    }

    const provider = this.tokenProviders.get(platform);
    if (!provider) {
      this.logger.warn(`No token provider registered for platform: ${platform}`);
      return null;
    }

    const refreshPromise = (async (): Promise<StoredToken | null> => {
      try {
        const newToken = await provider(platform, tokenType);
        await this.setToken(platform, tokenType, newToken.token, newToken.expiresAt);
        this.logger.info(`Token refreshed for ${platform}:${tokenType}`);
        return newToken;
      } catch (err) {
        this.logger.error(
          { message: `Token refresh failed for ${platform}:${tokenType}` },
          err instanceof Error ? err : new Error(String(err))
        );
        return null;
      } finally {
        this.tokenRefreshPromises.delete(refreshKey);
      }
    })();

    this.tokenRefreshPromises.set(refreshKey, refreshPromise);
    return refreshPromise;
  }

  async clearPlatformTokens(platform: string): Promise<void> {
    for (const tokenType of Object.values(TokenType)) {
      const key = this.getStorageKey(platform, tokenType);
      await keyValueRepository.removeItem(key);
    }
    this.tokenProviders.delete(platform);
    this.logger.info(`Cleared all tokens for platform: ${platform}`);
  }

  async hasValidToken(platform: string, tokenType: TokenType): Promise<boolean> {
    const key = this.getStorageKey(platform, tokenType);
    const stored = await keyValueRepository.getObject<StoredToken>(key);
    if (!stored) return false;
    if (stored.expiresAt && stored.expiresAt < Date.now()) return false;
    return true;
  }
}

export const tokenService = TokenService.getInstance();
