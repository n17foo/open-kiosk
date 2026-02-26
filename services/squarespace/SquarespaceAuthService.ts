import type { AuthService, User, AuthToken } from '../interfaces';

export class SquarespaceAuthService implements AuthService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async login(username: string, _password: string): Promise<User> {
    // Squarespace Commerce API — look up customer by email
    const response = await this.makeRequest(`commerce/orders?modifiedAfter=2000-01-01T00:00:00Z&fulfillmentStatus=PENDING`);

    // Find customer from order history matching the email
    const order = response.result?.find((o: any) => o.billingAddress?.email?.toLowerCase() === username.toLowerCase());

    if (order) {
      return {
        id: order.billingAddress?.email ?? 'squarespace-customer',
        email: order.billingAddress?.email ?? username,
        name: `${order.billingAddress?.firstName ?? ''} ${order.billingAddress?.lastName ?? ''}`.trim(),
        roles: ['customer'],
      };
    }

    // Fallback: create a guest user
    return {
      id: `guest-${Date.now()}`,
      email: username,
      name: username.split('@')[0],
      roles: ['customer'],
    };
  }

  async logout(): Promise<void> {
    // No session to clear
  }

  async refreshToken(): Promise<AuthToken> {
    return { accessToken: this.accessToken };
  }

  async getCurrentUser(): Promise<User | null> {
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/1.0/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Squarespace API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
