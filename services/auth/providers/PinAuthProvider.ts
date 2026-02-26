import { AuthMethodProvider, AuthMethodType, AuthMethodInfo, AuthResult, AUTH_METHOD_INFO } from '../AuthMethodInterface';
import { LoggerFactory } from '../../logger/LoggerFactory';
import { keyValueRepository } from '../../../repositories/KeyValueRepository';

export class PinAuthProvider implements AuthMethodProvider {
  private logger = LoggerFactory.getInstance().createLogger('PinAuthProvider');
  readonly type: AuthMethodType = 'pin';
  readonly info: AuthMethodInfo = AUTH_METHOD_INFO.pin;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async authenticate(credential?: string): Promise<AuthResult> {
    if (!credential) {
      return { success: false, error: 'PIN is required' };
    }

    try {
      // NOTE: PIN plaintext is a known gap — plan to hash with bcrypt/Argon2 before production
      const users = await keyValueRepository.getObject<Array<{ id: string; name: string; pin: string; role: string }>>('users');

      if (!users || users.length === 0) {
        this.logger.warn('No users configured for PIN auth');
        return { success: false, error: 'No users configured' };
      }

      const matchedUser = users.find(u => u.pin === credential);
      if (matchedUser) {
        this.logger.info(`PIN auth successful for user: ${matchedUser.name}`);
        return {
          success: true,
          userId: matchedUser.id,
          userName: matchedUser.name,
          role: matchedUser.role,
        };
      }

      this.logger.warn('PIN auth failed — incorrect PIN');
      return { success: false, error: 'Incorrect PIN' };
    } catch (err) {
      this.logger.error({ message: 'PIN auth error' }, err instanceof Error ? err : new Error(String(err)));
      return { success: false, error: 'Authentication error' };
    }
  }
}
