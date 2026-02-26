import type { UpsellService, UpgradeOffer, Basket } from '../interfaces';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('PrestaShopUpsellService');

export class PrestaShopUpsellService implements UpsellService {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getUpgradeOffers(_productId?: string): Promise<UpgradeOffer[]> {
    try {
      // PrestaShop accessories can model upgrades via webservice
      return [];
    } catch (error) {
      logger.error({ message: 'Failed to fetch PrestaShop upgrade offers' }, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async getUpgradeOffer(_id: string): Promise<UpgradeOffer | undefined> {
    return undefined;
  }

  async applyUpgrade(_productId: string, _upgradeId: string): Promise<Basket> {
    throw new Error('PrestaShop upgrade application not yet implemented');
  }

  async removeUpgrade(_productId: string): Promise<Basket> {
    throw new Error('PrestaShop upgrade removal not yet implemented');
  }
}
