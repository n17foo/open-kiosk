import type { AuthService, User, AuthToken } from '../interfaces';

export class InMemoryAuthService implements AuthService {
  private currentUser: User | null = null;
  private token: AuthToken | null = null;

  async login(username: string, password: string): Promise<User> {
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock authentication - any username/password works
    const user: User = {
      id: 'mock-user',
      email: username.includes('@') ? username : `${username}@example.com`,
      name: username,
      roles: ['customer'],
    };

    this.currentUser = user;
    this.token = {
      accessToken: 'mock-jwt-token',
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };

    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.token = null;
  }

  async refreshToken(): Promise<AuthToken> {
    if (!this.token) {
      throw new Error('No active session');
    }

    const newToken: AuthToken = {
      accessToken: 'refreshed-mock-jwt-token',
      expiresAt: Date.now() + (24 * 60 * 60 * 1000),
    };

    this.token = newToken;
    return newToken;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }
}
