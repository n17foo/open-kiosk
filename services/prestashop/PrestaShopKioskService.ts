import type { KioskService, PlatformConfig } from '../interfaces';
import type {
  AuthService,
  BasketService,
  CatalogService,
  ProductService,
  CrossSellService,
  CmsService,
  CheckoutService,
  UpsellService,
} from '../interfaces';
import { PrestaShopAuthService } from './PrestaShopAuthService';
import { PrestaShopBasketService } from './PrestaShopBasketService';
import { PrestaShopCatalogService } from './PrestaShopCatalogService';
import { PrestaShopProductService } from './PrestaShopProductService';
import { PrestaShopCrossSellService } from './PrestaShopCrossSellService';
import { PrestaShopCheckoutService } from './PrestaShopCheckoutService';
import { PrestaShopUpsellService } from './PrestaShopUpsellService';
import { GenericCmsService } from '../cms';
import { BaseApiClient } from '../utils/BaseApiClient';

export class PrestaShopKioskService implements KioskService {
  readonly config: PlatformConfig;

  readonly auth: AuthService;
  readonly basket: BasketService;
  readonly catalog: CatalogService;
  readonly products: ProductService;
  readonly crossSell: CrossSellService;
  readonly cms: CmsService;
  readonly checkout: CheckoutService;
  readonly upsell: UpsellService;

  readonly apiClient: BaseApiClient;

  private baseUrl: string;
  private apiKey: string;

  constructor(config: PlatformConfig) {
    this.config = config;

    if (!config.baseUrl || !config.apiKey) {
      throw new Error('PrestaShop configuration requires baseUrl (store URL) and apiKey (webservice key)');
    }

    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;

    const auth = btoa(`${this.apiKey}:`);
    this.apiClient = new BaseApiClient({
      baseUrl: `${this.baseUrl}/api`,
      defaultHeaders: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    this.auth = new PrestaShopAuthService(this.baseUrl, this.apiKey);
    this.basket = new PrestaShopBasketService(this.baseUrl, this.apiKey);
    this.catalog = new PrestaShopCatalogService(this.baseUrl, this.apiKey);
    this.products = new PrestaShopProductService(this.baseUrl, this.apiKey);
    this.crossSell = new PrestaShopCrossSellService(this.baseUrl, this.apiKey);
    this.checkout = new PrestaShopCheckoutService(this.baseUrl, this.apiKey, this.config);
    this.cms = new GenericCmsService(this.baseUrl, this.config.apiKey);
    this.upsell = new PrestaShopUpsellService(this.baseUrl, this.apiKey);
  }

  async initialize(): Promise<void> {
    try {
      await this.catalog.getCategories();
    } catch (error) {
      throw new Error(`Failed to connect to PrestaShop store: ${error}`);
    }
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }
}
