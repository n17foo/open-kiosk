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
import { BigCommerceAuthService } from './BigCommerceAuthService';
import { BigCommerceBasketService } from './BigCommerceBasketService';
import { BigCommerceCatalogService } from './BigCommerceCatalogService';
import { BigCommerceProductService } from './BigCommerceProductService';
import { BigCommerceCrossSellService } from './BigCommerceCrossSellService';
import { BigCommerceCheckoutService } from './BigCommerceCheckoutService';
import { BigCommerceUpsellService } from './BigCommerceUpsellService';
import { GenericCmsService } from '../cms';
import { BaseApiClient } from '../utils/BaseApiClient';

export class BigCommerceKioskService implements KioskService {
  readonly config: PlatformConfig;

  readonly auth: AuthService;
  readonly basket: BasketService;
  readonly catalog: CatalogService;
  readonly products: ProductService;
  readonly crossSell: CrossSellService;
  readonly cms: CmsService;
  readonly checkout: CheckoutService;
  readonly upsell: UpsellService;

  /** Shared HTTP client with retry/timeout for all sub-services */
  readonly apiClient: BaseApiClient;

  private baseUrl: string;
  private accessToken: string;

  constructor(config: PlatformConfig) {
    this.config = config;

    if (!config.baseUrl || !config.accessToken) {
      throw new Error('BigCommerce configuration requires baseUrl (store API URL) and accessToken (API token)');
    }

    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;

    this.apiClient = new BaseApiClient({
      baseUrl: `${this.baseUrl}/v3`,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'X-Auth-Token': this.accessToken,
      },
    });

    this.auth = new BigCommerceAuthService(this.baseUrl, this.accessToken);
    this.basket = new BigCommerceBasketService(this.baseUrl, this.accessToken);
    this.catalog = new BigCommerceCatalogService(this.baseUrl, this.accessToken);
    this.products = new BigCommerceProductService(this.baseUrl, this.accessToken);
    this.crossSell = new BigCommerceCrossSellService(this.baseUrl, this.accessToken);
    this.checkout = new BigCommerceCheckoutService(this.baseUrl, this.accessToken, this.config);
    this.cms = new GenericCmsService(this.baseUrl, this.config.apiKey);
    this.upsell = new BigCommerceUpsellService(this.baseUrl, this.accessToken);
  }

  async initialize(): Promise<void> {
    try {
      await this.catalog.getCategories();
    } catch (error) {
      throw new Error(`Failed to connect to BigCommerce store: ${error}`);
    }
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }
}
