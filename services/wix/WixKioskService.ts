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
import { WixAuthService } from './WixAuthService';
import { WixBasketService } from './WixBasketService';
import { WixCatalogService } from './WixCatalogService';
import { WixProductService } from './WixProductService';
import { WixCrossSellService } from './WixCrossSellService';
import { WixCheckoutService } from './WixCheckoutService';
import { WixUpsellService } from './WixUpsellService';
import { GenericCmsService } from '../cms';
import { BaseApiClient } from '../utils/BaseApiClient';

export class WixKioskService implements KioskService {
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
      throw new Error('Wix configuration requires baseUrl (Wix API base URL) and apiKey (API key)');
    }

    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;

    this.apiClient = new BaseApiClient({
      baseUrl: this.baseUrl,
      defaultHeaders: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
      },
    });

    this.auth = new WixAuthService(this.baseUrl, this.apiKey);
    this.basket = new WixBasketService(this.baseUrl, this.apiKey);
    this.catalog = new WixCatalogService(this.baseUrl, this.apiKey);
    this.products = new WixProductService(this.baseUrl, this.apiKey);
    this.crossSell = new WixCrossSellService(this.baseUrl, this.apiKey);
    this.checkout = new WixCheckoutService(this.baseUrl, this.apiKey, this.config);
    this.cms = new GenericCmsService(this.baseUrl, this.config.apiKey);
    this.upsell = new WixUpsellService(this.baseUrl, this.apiKey);
  }

  async initialize(): Promise<void> {
    try {
      await this.catalog.getCategories();
    } catch (error) {
      throw new Error(`Failed to connect to Wix store: ${error}`);
    }
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }
}
