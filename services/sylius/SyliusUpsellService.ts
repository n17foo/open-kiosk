import type { UpsellService, UpgradeOffer, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SyliusUpsellService');

export class SyliusUpsellService implements UpsellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getUpgradeOffers(_productId?: string): Promise<UpgradeOffer[]> {
    try {
      // Sylius product associations can model upgrades
      return [];
    } catch (error) {
      logger.error({ message: 'Failed to fetch Sylius upgrade offers' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpgradeOffer(_id: string): Promise<UpgradeOffer | undefined> {
    return undefined;
  }

  async applyUpgrade(_productId: string, _upgradeId: string): Promise<Basket> {
    throw new Error('Sylius upgrade application not yet implemented');
  }

  async removeUpgrade(_productId: string): Promise<Basket> {
    throw new Error('Sylius upgrade removal not yet implemented');
  }
}
