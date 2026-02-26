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
import { WooCommerceAuthService } from './WooCommerceAuthService';
import { WooCommerceBasketService } from './WooCommerceBasketService';
import { WooCommerceCatalogService } from './WooCommerceCatalogService';
import { WooCommerceProductService } from './WooCommerceProductService';
import { WooCommerceCrossSellService } from './WooCommerceCrossSellService';
import { WooCommerceCheckoutService } from './WooCommerceCheckoutService';
import { GenericCmsService } from '../cms';
import { BaseApiClient } from '../utils/BaseApiClient';

export class WooCommerceKioskService implements KioskService {
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
  private consumerKey: string;
  private consumerSecret: string;

  constructor(config: PlatformConfig) {
    this.config = config;

    if (!config.baseUrl || !config.apiKey || !config.apiSecret) {
      throw new Error('WooCommerce configuration requires baseUrl, apiKey (consumer key), and apiSecret (consumer secret)');
    }

    this.baseUrl = config.baseUrl;
    this.consumerKey = config.apiKey;
    this.consumerSecret = config.apiSecret;

    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
    this.apiClient = new BaseApiClient({
      baseUrl: `${this.baseUrl}/wp-json/wc/v3`,
      defaultHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
    });

    // Initialize service components
    this.auth = new WooCommerceAuthService(this.baseUrl, this.consumerKey, this.consumerSecret);
    this.basket = new WooCommerceBasketService(this.baseUrl, this.consumerKey, this.consumerSecret);
    this.catalog = new WooCommerceCatalogService(this.baseUrl, this.consumerKey, this.consumerSecret);
    this.products = new WooCommerceProductService(this.baseUrl, this.consumerKey, this.consumerSecret);
    this.crossSell = new WooCommerceCrossSellService(this.baseUrl, this.consumerKey, this.consumerSecret);
    this.checkout = new WooCommerceCheckoutService(this.baseUrl, this.consumerKey, this.consumerSecret, this.config);
    this.cms = new GenericCmsService(this.baseUrl, this.config.apiKey);
  }

  async initialize(): Promise<void> {
    // Validate connection to WooCommerce store
    try {
      await this.catalog.getCategories();
    } catch (error) {
      throw new Error(`Failed to connect to WooCommerce store: ${error}`);
    }
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }

  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/wp-json/wc/v3/${endpoint}`;

    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
