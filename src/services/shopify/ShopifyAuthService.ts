import type { AuthService, User, AuthToken } from '../interfaces';

export class ShopifyAuthService implements AuthService {
  constructor(private baseUrl: string, private accessToken: string) {}

  async login(username: string, password: string): Promise<User> {
    // Shopify doesn't have traditional username/password auth for storefront
    // This would typically use Shopify's customer accounts or a custom auth solution
    // For now, we'll simulate auth
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: 'shopify-customer-1',
      email: username,
      name: username.split('@')[0],
      roles: ['customer'],
    };
  }

  async logout(): Promise<void> {
    // Clear any stored tokens/session
  }

  async refreshToken(): Promise<AuthToken> {
    // Shopify access tokens are typically long-lived for storefront API
    return {
      accessToken: this.accessToken,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    // In a real implementation, this would validate the current session
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}
