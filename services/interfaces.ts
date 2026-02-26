import type {
  AuthToken,
  Basket,
  BasketLine,
  Category,
  KioskCatalog,
  Money,
  PlatformConfig,
  Product,
  SplashScreenData,
  UpgradeOffer,
  User,
} from './types';
import type { PaymentMethod } from './payment';

export interface AuthService {
  login(username: string, password: string): Promise<User>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthToken>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
}

export interface BasketService {
  getBasket(): Promise<Basket>;
  addToBasket(line: BasketLine): Promise<Basket>;
  removeFromBasket(productId: string): Promise<Basket>;
  updateBasketItem(productId: string, quantity: number): Promise<Basket>;
  clearBasket(): Promise<Basket>;
  applyDiscount(code: string): Promise<Basket>;
  removeDiscount(): Promise<Basket>;
}

export interface CatalogService {
  getCatalog(): Promise<KioskCatalog>;
  getCategories(): Promise<Category[]>;
  getProducts(categoryId?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
}

export interface ProductService {
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getProductVariants(productId: string): Promise<Product[]>;
  getUpsellRecommendations(productId: string): Promise<Product[]>;
}

export interface CrossSellService {
  getCrossSellProducts(productId: string): Promise<Product[]>;
  getCrossSellProductsForBasket(basket: Basket): Promise<Product[]>;
}

export interface CmsService {
  getSplashScreenData(): Promise<SplashScreenData>;
}

export interface CheckoutData {
  id: string;
  url?: string;
  paymentMethods: PaymentMethod[];
  total: Money;
  currency: string;
  expiresAt?: Date;
}

export interface CheckoutService {
  createCheckout(basket: Basket): Promise<string>; // Returns checkout URL or ID
  getCheckoutData(checkoutId: string): Promise<CheckoutData>; // Get checkout with payment methods
  getCheckoutStatus(checkoutId: string): Promise<any>;
  processPayment(checkoutId: string, paymentData: any): Promise<any>;
  confirmOrder(orderId: string): Promise<any>;
}

export interface UpsellService {
  getUpgradeOffers(productId?: string): Promise<UpgradeOffer[]>;
  getUpgradeOffer(id: string): Promise<UpgradeOffer | undefined>;
  applyUpgrade(productId: string, upgradeId: string): Promise<Basket>;
  removeUpgrade(productId: string): Promise<Basket>;
}

export interface KioskService {
  readonly config: PlatformConfig;

  // Service components
  readonly auth: AuthService;
  readonly basket: BasketService;
  readonly catalog: CatalogService;
  readonly products: ProductService;
  readonly crossSell: CrossSellService;
  readonly cms: CmsService;
  readonly checkout: CheckoutService;

  // Initialization
  initialize(): Promise<void>;
  dispose(): Promise<void>;
}

export interface ServiceFactory {
  createService(config: PlatformConfig): Promise<KioskService>;
  getSupportedPlatforms(): PlatformType[];
}

export type PlatformType = PlatformConfig['type'];

// Re-export types from types.ts for convenience
export type {
  AuthToken,
  Basket,
  BasketLine,
  Category,
  KioskCatalog,
  Money,
  PlatformConfig,
  Product,
  SplashScreenData,
  UpgradeOffer,
  User,
  VariantGroup,
  VariantItem,
} from './types';

// Re-export PaymentMethod from payment module
export type { PaymentMethod } from './payment';
