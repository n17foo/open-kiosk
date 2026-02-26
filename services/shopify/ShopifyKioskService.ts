import type { KioskService, PlatformConfig } from '../interfaces';
import type {
  AuthService,
  BasketService,
  CatalogService,
  ProductService,
  CrossSellService,
  CmsService,
  CheckoutService,
} from '../interfaces';
import { ShopifyAuthService } from './ShopifyAuthService';
import { ShopifyBasketService } from './ShopifyBasketService';
import { ShopifyCatalogService } from './ShopifyCatalogService';
import { ShopifyProductService } from './ShopifyProductService';
import { ShopifyCrossSellService } from './ShopifyCrossSellService';
import { ShopifyCheckoutService } from './ShopifyCheckoutService';
import { GenericCmsService } from '../cms';
import { BaseApiClient } from '../utils/BaseApiClient';

export class ShopifyKioskService implements KioskService {
  readonly config: PlatformConfig;

  readonly auth: AuthService;
  readonly basket: BasketService;
  readonly catalog: CatalogService;
  readonly products: ProductService;
  readonly crossSell: CrossSellService;
  readonly cms: CmsService;
  readonly checkout: CheckoutService;

  readonly apiClient: BaseApiClient;

  private baseUrl: string;
  private accessToken: string;

  constructor(config: PlatformConfig) {
    this.config = config;

    if (!config.baseUrl || !config.accessToken) {
      throw new Error('Shopify configuration requires baseUrl and accessToken');
    }

    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;

    this.apiClient = new BaseApiClient({
      baseUrl: `${this.baseUrl}/api/2023-10`,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
    });

    // Initialize service components
    this.auth = new ShopifyAuthService(this.baseUrl, this.accessToken);
    this.basket = new ShopifyBasketService(this.baseUrl, this.accessToken);
    this.catalog = new ShopifyCatalogService(this.baseUrl, this.accessToken);
    this.products = new ShopifyProductService(this.baseUrl, this.accessToken);
    this.crossSell = new ShopifyCrossSellService(this.baseUrl, this.accessToken);
    this.checkout = new ShopifyCheckoutService(this.baseUrl, this.accessToken, this.config);
    this.cms = new GenericCmsService(this.baseUrl, this.config.apiKey);
  }

  async initialize(): Promise<void> {
    // Validate connection to Shopify store
    try {
      await this.catalog.getCategories();
    } catch (error) {
      throw new Error(`Failed to connect to Shopify store: ${error}`);
    }
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/api/2023-10/${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
