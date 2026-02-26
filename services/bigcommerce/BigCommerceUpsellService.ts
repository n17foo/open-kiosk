import type { UpsellService, UpgradeOffer, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('BigCommerceUpsellService');

export class BigCommerceUpsellService implements UpsellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getUpgradeOffers(_productId?: string): Promise<UpgradeOffer[]> {
    try {
      // BigCommerce doesn't have a native upsell/upgrade API
      // This would be powered by a custom metafield or third-party app
      return [];
    } catch (error) {
      logger.error({ message: 'Failed to fetch BigCommerce upgrade offers' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpgradeOffer(_id: string): Promise<UpgradeOffer | undefined> {
    return undefined;
  }

  async applyUpgrade(_productId: string, _upgradeId: string): Promise<Basket> {
    throw new Error('BigCommerce upgrade application not yet implemented');
  }

  async removeUpgrade(_productId: string): Promise<Basket> {
    throw new Error('BigCommerce upgrade removal not yet implemented');
  }
}
