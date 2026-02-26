import type { AuthService, User, AuthToken } from '../interfaces';

export class BigCommerceAuthService implements AuthService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async login(username: string, _password: string): Promise<User> {
    // BigCommerce storefront customer login via Customer Login API
    // In a kiosk context, we use the admin API to look up customers
    const response = await this.makeRequest(`customers?email:in=${encodeURIComponent(username)}`);
    const customer = response.data?.[0];

    if (!customer) {
      throw new Error('Customer not found');
    }

    return {
      id: String(customer.id),
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      roles: ['customer'],
    };
  }

  async logout(): Promise<void> {
    // Clear any stored session data
  }

  async refreshToken(): Promise<AuthToken> {
    // BigCommerce API tokens are long-lived store-level tokens
    return {
      accessToken: this.accessToken,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v3/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`BigCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
