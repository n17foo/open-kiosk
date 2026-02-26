import type { AuthService, User, AuthToken } from '../interfaces';

export class PrestaShopAuthService implements AuthService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async login(username: string, _password: string): Promise<User> {
    // PrestaShop customer lookup via webservice
    const response = await this.makeRequest(`customers?filter[email]=${encodeURIComponent(username)}&display=full`);
    const customer = response.customers?.[0];

    if (!customer) {
      throw new Error('Customer not found');
    }

    return {
      id: String(customer.id),
      email: customer.email,
      name: `${customer.firstname ?? ''} ${customer.lastname ?? ''}`.trim(),
      roles: ['customer'],
    };
  }

  async logout(): Promise<void> {
    // No session to clear for API key auth
  }

  async refreshToken(): Promise<AuthToken> {
    return { accessToken: this.apiKey };
  }

  async getCurrentUser(): Promise<User | null> {
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.apiKey;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const auth = btoa(`${this.apiKey}:`);
    const response = await fetch(`${this.baseUrl}/api/${endpoint}&output_format=JSON`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PrestaShop API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
