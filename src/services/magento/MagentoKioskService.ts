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
import { MagentoAuthService } from './MagentoAuthService';
import { MagentoBasketService } from './MagentoBasketService';
import { MagentoCatalogService } from './MagentoCatalogService';
import { MagentoProductService } from './MagentoProductService';
import { MagentoCrossSellService } from './MagentoCrossSellService';
import { MagentoCheckoutService } from './MagentoCheckoutService';
import { GenericCmsService } from '../cms';

export class MagentoKioskService implements KioskService {
  readonly config: PlatformConfig;

  readonly auth: AuthService;
  readonly basket: BasketService;
  readonly catalog: CatalogService;
  readonly products: ProductService;
  readonly crossSell: CrossSellService;
  readonly cms: CmsService;
  readonly checkout: CheckoutService;

  private baseUrl: string;
  private accessToken: string;

  constructor(config: PlatformConfig) {
    this.config = config;

    if (!config.baseUrl || !config.accessToken) {
      throw new Error('Magento configuration requires baseUrl and accessToken (admin token)');
    }

    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;

    // Initialize service components
    this.auth = new MagentoAuthService(this.baseUrl, this.accessToken);
    this.basket = new MagentoBasketService(this.baseUrl, this.accessToken);
    this.catalog = new MagentoCatalogService(this.baseUrl, this.accessToken);
    this.products = new MagentoProductService(this.baseUrl, this.accessToken);
    this.crossSell = new MagentoCrossSellService(this.baseUrl, this.accessToken);
    this.checkout = new MagentoCheckoutService(this.baseUrl, this.accessToken, this.config);
    this.cms = new GenericCmsService(this.baseUrl, this.config.apiKey);
  }

  async initialize(): Promise<void> {
    // Validate connection to Magento store
    try {
      await this.catalog.getCategories();
    } catch (error) {
      throw new Error(`Failed to connect to Magento store: ${error}`);
    }
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }

  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/rest/V1/${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Magento API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
