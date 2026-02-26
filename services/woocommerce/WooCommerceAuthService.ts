import type { AuthService, User, AuthToken } from '../interfaces';

export class WooCommerceAuthService implements AuthService {
  private currentUser: User | null = null;
  private token: AuthToken | null = null;

  constructor(
    private baseUrl: string,
    private consumerKey: string,
    private consumerSecret: string
  ) {}

  async login(_username: string, _password: string): Promise<User> {
    // For kiosk purposes, we'll simulate authentication
    // In a real implementation, you might use WooCommerce customers API
    // or integrate with a custom authentication system

    // Simulate successful login for demo purposes
    this.currentUser = {
      id: 'kiosk-user',
      email: 'kiosk@example.com',
      name: 'Kiosk User',
      roles: ['customer'],
    };

    this.token = {
      accessToken: 'kiosk-token-' + Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.token = null;
  }

  async refreshToken(): Promise<AuthToken> {
    if (!this.token) {
      throw new Error('No token to refresh');
    }

    // Extend token expiration
    this.token = {
      ...this.token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    return this.token;
  }

  getCurrentUser(): Promise<User | null> {
    return Promise.resolve(this.currentUser);
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null && (this.token.expiresAt || 0) > Date.now();
  }
}
