import type { UpsellService, UpgradeOffer, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('WixUpsellService');

export class WixUpsellService implements UpsellService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getUpgradeOffers(_productId?: string): Promise<UpgradeOffer[]> {
    try {
      // Wix doesn't have a native upsell/upgrade API
      return [];
    } catch (error) {
      logger.error({ message: 'Failed to fetch Wix upgrade offers' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpgradeOffer(_id: string): Promise<UpgradeOffer | undefined> {
    return undefined;
  }

  async applyUpgrade(_productId: string, _upgradeId: string): Promise<Basket> {
    throw new Error('Wix upgrade application not yet implemented');
  }

  async removeUpgrade(_productId: string): Promise<Basket> {
    throw new Error('Wix upgrade removal not yet implemented');
  }
}
