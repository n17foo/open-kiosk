import { AuthMethodProvider, AuthMethodType, AuthMethodInfo, AuthResult, AUTH_METHOD_INFO } from '../AuthMethodInterface';
import { LoggerFactory } from '../../logger/LoggerFactory';
import { keyValueRepository } from '../../../repositories/KeyValueRepository';

export class KioskPinAuthProvider implements AuthMethodProvider {
  private logger = LoggerFactory.getInstance().createLogger('KioskPinAuthProvider');
  readonly type: AuthMethodType = 'kiosk_pin';
  readonly info: AuthMethodInfo = AUTH_METHOD_INFO.kiosk_pin;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async authenticate(credential?: string): Promise<AuthResult> {
    if (!credential) {
      return { success: false, error: 'Admin PIN is required' };
    }

    try {
      const adminPin = await keyValueRepository.getItem('kiosk_admin_pin');
      const defaultPin = '0000';

      const expectedPin = adminPin ?? defaultPin;

      if (credential === expectedPin) {
        this.logger.info('Kiosk admin PIN auth successful');
        return {
          success: true,
          userId: 'kiosk-admin',
          userName: 'Kiosk Admin',
          role: 'admin',
        };
      }

      this.logger.warn('Kiosk admin PIN auth failed');
      return { success: false, error: 'Incorrect admin PIN' };
    } catch (err) {
      this.logger.error({ message: 'Kiosk PIN auth error' }, err instanceof Error ? err : new Error(String(err)));
      return { success: false, error: 'Authentication error' };
    }
  }
}
