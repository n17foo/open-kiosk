import type { AuthService, User, AuthToken } from '../interfaces';

export class SyliusAuthService implements AuthService {
  private token: string | null = null;

  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {
    this.token = accessToken;
  }

  async login(username: string, password: string): Promise<User> {
    // Sylius uses OAuth2 for API authentication
    const response = await fetch(`${this.baseUrl}/api/v2/shop/authentication-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    this.token = data.token;

    return {
      id: String(data.customer?.id ?? 'sylius-customer'),
      email: username,
      name: data.customer?.fullName ?? username.split('@')[0],
      roles: ['customer'],
    };
  }

  async logout(): Promise<void> {
    this.token = null;
  }

  async refreshToken(): Promise<AuthToken> {
    return {
      accessToken: this.token ?? this.accessToken,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/v2/shop/customers/me`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/ld+json',
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        id: String(data.id),
        email: data.email,
        name: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
        roles: ['customer'],
      };
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}
