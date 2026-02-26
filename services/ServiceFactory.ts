import type { KioskService, ServiceFactory, PlatformConfig, PlatformType } from './interfaces';
import { InMemoryKioskService } from './InMemoryKioskService';
import { ShopifyKioskService } from './shopify/ShopifyKioskService';
import { WooCommerceKioskService } from './woocommerce/WooCommerceKioskService';
import { MagentoKioskService } from './magento/MagentoKioskService';
import { BigCommerceKioskService } from './bigcommerce/BigCommerceKioskService';
import { SyliusKioskService } from './sylius/SyliusKioskService';
import { WixKioskService } from './wix/WixKioskService';
import { PrestaShopKioskService } from './prestashop/PrestaShopKioskService';
import { SquarespaceKioskService } from './squarespace/SquarespaceKioskService';

export class KioskServiceFactory implements ServiceFactory {
  private static instance: KioskServiceFactory;

  private constructor() {}

  static getInstance(): KioskServiceFactory {
    if (!KioskServiceFactory.instance) {
      KioskServiceFactory.instance = new KioskServiceFactory();
    }
    return KioskServiceFactory.instance;
  }

  async createService(config: PlatformConfig): Promise<KioskService> {
    switch (config.type) {
      case 'inmemory':
        return new InMemoryKioskService(config);

      case 'shopify':
        return new ShopifyKioskService(config);

      case 'woocommerce':
        return new WooCommerceKioskService(config);

      case 'magento':
        return new MagentoKioskService(config);

      case 'bigcommerce':
        return new BigCommerceKioskService(config);

      case 'sylius':
        return new SyliusKioskService(config);

      case 'wix':
        return new WixKioskService(config);

      case 'prestashop':
        return new PrestaShopKioskService(config);

      case 'squarespace':
        return new SquarespaceKioskService(config);

      default:
        throw new Error(`Unsupported platform type: ${config.type}`);
    }
  }

  getSupportedPlatforms(): PlatformType[] {
    return ['inmemory', 'shopify', 'woocommerce', 'magento', 'bigcommerce', 'sylius', 'wix', 'prestashop', 'squarespace'];
  }

  getDefaultConfig(): PlatformConfig {
    return {
      type: 'inmemory',
      name: 'In-Memory Demo',
    };
  }
}

// Export singleton instance
export const serviceFactory = KioskServiceFactory.getInstance();
