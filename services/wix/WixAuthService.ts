import type { AuthService, User, AuthToken } from '../interfaces';

export class WixAuthService implements AuthService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async login(username: string, _password: string): Promise<User> {
    // Wix uses member authentication — in kiosk context we look up contacts
    const response = await this.makeRequest('contacts/v4/contacts/query', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          filter: { 'info.emails.email': { $eq: username } },
          paging: { limit: 1 },
        },
      }),
    });

    const contact = response.contacts?.[0];
    if (!contact) {
      throw new Error('Contact not found');
    }

    return {
      id: contact.id,
      email: contact.info?.emails?.[0]?.email ?? username,
      name: `${contact.info?.name?.first ?? ''} ${contact.info?.name?.last ?? ''}`.trim(),
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

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
        'wix-site-id': this.baseUrl.split('/').pop() ?? '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
