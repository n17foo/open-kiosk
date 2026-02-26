import type { UpsellService, UpgradeOffer, Basket } from '../interfaces';

export class MagentoUpsellService implements UpsellService {
  constructor(
    private baseUrl: string,
    private accessToken: string
  ) {}

  async getUpgradeOffers(_productId?: string): Promise<UpgradeOffer[]> {
    // TODO: Implement upgrade offers - could be premium versions of products
    // For now, return empty array
    return [];
  }

  async getUpgradeOffer(id: string): Promise<UpgradeOffer | undefined> {
    const offers = await this.getUpgradeOffers();
    return offers.find(o => o.id === id);
  }

  async applyUpgrade(_productId: string, _upgradeId: string): Promise<Basket> {
    // TODO: Implement upgrade application
    throw new Error('Upgrade application not implemented');
  }

  async removeUpgrade(_productId: string): Promise<Basket> {
    // TODO: Implement upgrade removal
    throw new Error('Upgrade removal not implemented');
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/rest/V1/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Magento API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
