import type { UpsellService, UpgradeOffer, Basket } from '../interfaces';

export class ShopifyUpsellService implements UpsellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getUpgradeOffers(_productId?: string): Promise<UpgradeOffer[]> {
    // TODO: Implement upgrade offers
    return [];
  }

  async getUpgradeOffer(_id: string): Promise<UpgradeOffer | undefined> {
    // TODO: Implement upgrade offer fetching
    return undefined;
  }

  async applyUpgrade(_productId: string, _upgradeId: string): Promise<Basket> {
    // TODO: Apply upgrade
    throw new Error('Shopify upgrade application not yet implemented');
  }

  async removeUpgrade(_productId: string): Promise<Basket> {
    // TODO: Remove upgrade
    throw new Error('Shopify upgrade removal not yet implemented');
  }
}
