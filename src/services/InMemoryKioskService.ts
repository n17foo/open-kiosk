import type {
  PlatformConfig,
  KioskService,
  AuthService,
  BasketService,
  CatalogService,
  ProductService,
  CrossSellService,
  CmsService,
  CheckoutService,
} from './interfaces';
import { InMemoryAuthService } from './implementations/InMemoryAuthService';
import { InMemoryBasketService } from './implementations/InMemoryBasketService';
import { InMemoryCatalogService } from './implementations/InMemoryCatalogService';
import { InMemoryProductService } from './implementations/InMemoryProductService';
import { InMemoryCrossSellService } from './implementations/InMemoryCrossSellService';
import { InMemoryCheckoutService } from './implementations/InMemoryCheckoutService';
import { MockCmsService } from './cms';

export class InMemoryKioskService implements KioskService {
  readonly config: PlatformConfig;

  readonly auth: AuthService;
  readonly basket: BasketService;
  readonly catalog: CatalogService;
  readonly products: ProductService;
  readonly crossSell: CrossSellService;
  readonly cms: CmsService;
  readonly checkout: CheckoutService;

  constructor(config: PlatformConfig) {
    this.config = config;

    this.auth = new InMemoryAuthService();
    this.basket = new InMemoryBasketService();
    this.catalog = new InMemoryCatalogService();
    this.products = new InMemoryProductService();
    this.crossSell = new InMemoryCrossSellService();
    this.checkout = new InMemoryCheckoutService(this.config);
    this.cms = new MockCmsService();
  }

  async initialize(): Promise<void> {
    // No initialization needed for in-memory service
  }

  async dispose(): Promise<void> {
    // No cleanup needed for in-memory service
  }
}

// Legacy compatibility - create default instance
const defaultConfig: PlatformConfig = {
  type: 'inmemory',
  name: 'In-Memory Demo',
};

export const kioskService = new InMemoryKioskService(defaultConfig);
