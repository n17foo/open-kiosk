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
import { SyliusAuthService } from './SyliusAuthService';
import { SyliusBasketService } from './SyliusBasketService';
import { SyliusCatalogService } from './SyliusCatalogService';
import { SyliusProductService } from './SyliusProductService';
import { SyliusCrossSellService } from './SyliusCrossSellService';
import { SyliusCheckoutService } from './SyliusCheckoutService';
import { SyliusUpsellService } from './SyliusUpsellService';
import { GenericCmsService } from '../cms';
import { BaseApiClient } from '../utils/BaseApiClient';

export class SyliusKioskService implements KioskService {
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
  private accessToken: string;

  constructor(config: PlatformConfig) {
    this.config = config;

    if (!config.baseUrl || !config.accessToken) {
      throw new Error('Sylius configuration requires baseUrl and accessToken (API JWT token)');
    }

    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;

    this.apiClient = new BaseApiClient({
      baseUrl: `${this.baseUrl}/api/v2`,
      defaultHeaders: {
        Accept: 'application/ld+json',
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    this.auth = new SyliusAuthService(this.baseUrl, this.accessToken);
    this.basket = new SyliusBasketService(this.baseUrl, this.accessToken);
    this.catalog = new SyliusCatalogService(this.baseUrl, this.accessToken);
    this.products = new SyliusProductService(this.baseUrl, this.accessToken);
    this.crossSell = new SyliusCrossSellService(this.baseUrl, this.accessToken);
    this.checkout = new SyliusCheckoutService(this.baseUrl, this.accessToken, this.config);
    this.cms = new GenericCmsService(this.baseUrl, this.config.apiKey);
    this.upsell = new SyliusUpsellService(this.baseUrl, this.accessToken);
  }

  async initialize(): Promise<void> {
    try {
      await this.catalog.getCategories();
    } catch (error) {
      throw new Error(`Failed to connect to Sylius store: ${error}`);
    }
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }
}
