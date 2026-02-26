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
import { SquarespaceAuthService } from './SquarespaceAuthService';
import { SquarespaceBasketService } from './SquarespaceBasketService';
import { SquarespaceCatalogService } from './SquarespaceCatalogService';
import { SquarespaceProductService } from './SquarespaceProductService';
import { SquarespaceCrossSellService } from './SquarespaceCrossSellService';
import { SquarespaceCheckoutService } from './SquarespaceCheckoutService';
import { SquarespaceUpsellService } from './SquarespaceUpsellService';
import { GenericCmsService } from '../cms';
import { BaseApiClient } from '../utils/BaseApiClient';

export class SquarespaceKioskService implements KioskService {
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
      throw new Error('Squarespace configuration requires baseUrl (API base URL) and accessToken (OAuth token)');
    }

    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;

    this.apiClient = new BaseApiClient({
      baseUrl: `${this.baseUrl}/1.0`,
      defaultHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    this.auth = new SquarespaceAuthService(this.baseUrl, this.accessToken);
    this.basket = new SquarespaceBasketService(this.baseUrl, this.accessToken);
    this.catalog = new SquarespaceCatalogService(this.baseUrl, this.accessToken);
    this.products = new SquarespaceProductService(this.baseUrl, this.accessToken);
    this.crossSell = new SquarespaceCrossSellService(this.baseUrl, this.accessToken);
    this.checkout = new SquarespaceCheckoutService(this.baseUrl, this.accessToken, this.config);
    this.cms = new GenericCmsService(this.baseUrl, this.config.apiKey);
    this.upsell = new SquarespaceUpsellService(this.baseUrl, this.accessToken);
  }

  async initialize(): Promise<void> {
    try {
      await this.catalog.getCategories();
    } catch (error) {
      throw new Error(`Failed to connect to Squarespace store: ${error}`);
    }
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }
}
