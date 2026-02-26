import type { UpsellService, UpgradeOffer, Basket } from '../interfaces';
import { MOCK_DATA } from '../mockData';

export class InMemoryUpsellService implements UpsellService {
  async getUpgradeOffers(productId?: string): Promise<UpgradeOffer[]> {
    if (!productId) {
      return MOCK_DATA.upgradeOffers;
    }

    // Return upgrade offers associated with the product
    const product = MOCK_DATA.products.find(p => p.id === productId);
    if (!product?.upgradeOfferId) return [];

    const upgrade = MOCK_DATA.upgradeOffers.find(u => u.id === product.upgradeOfferId);
    return upgrade ? [upgrade] : [];
  }

  async getUpgradeOffer(id: string): Promise<UpgradeOffer | undefined> {
    return MOCK_DATA.upgradeOffers.find(offer => offer.id === id);
  }

  async applyUpgrade(_productId: string, _upgradeId: string): Promise<Basket> {
    // This would modify the basket to include the upgrade
    // For now, just return a mock basket update
    throw new Error('Upgrade application not implemented in in-memory service');
  }

  async removeUpgrade(_productId: string): Promise<Basket> {
    // This would remove the upgrade from the basket
    throw new Error('Upgrade removal not implemented in in-memory service');
  }
}
