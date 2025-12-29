export interface Money {
  amount: number;
  currency: 'GBP';
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  parentId?: string; // For subcategories
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: Money;
  image?: string;
  upgradeOfferId?: string;
}

export interface UpgradeOffer {
  id: string;
  title: string;
  description?: string;
  priceDelta: Money;
  image?: string;
  addonGroupIds?: string[];
}

export interface VariantItem {
  id: string;
  name: string;
  price: Money;
  image?: string;
}

export interface VariantGroup {
  id: string;
  name: string;
  max?: number;
  items: VariantItem[];
}

export interface BasketLine {
  productId: string;
  name: string;
  qty: number;
  lineTotal: Money;
  variants?: VariantItem[];
}

export interface Basket {
  lines: BasketLine[];
  subtotal: Money;
  tax: Money;
  total: Money;
}

export interface KioskCatalog {
  categories: Category[];
  products: Product[];
  upgradeOffers: UpgradeOffer[];
  variantGroups: VariantGroup[];
}

// Platform Types
export type PlatformType =
  | 'shopify'
  | 'woocommerce'
  | 'magento'
  | 'bigcommerce'
  | 'sylius'
  | 'wix'
  | 'prestashop'
  | 'squarespace'
  | 'custom'
  | 'inmemory';

export interface PlatformConfig {
  type: PlatformType;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  storeId?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  customConfig?: Record<string, any>;

  // Payment processor configuration
  paymentProcessor?: {
    type: 'stripe' | 'square' | 'adyen' | 'mock';
    config?: {
      // Stripe
      apiKey?: string;
      publishableKey?: string;
      // Square
      applicationId?: string;
      accessToken?: string;
      locationId?: string;
      // Adyen
      merchantAccount?: string;
      terminalId?: string;
      // Common
      testMode?: boolean;
    };
  };

  // Kiosk configuration extension
  kioskConfig?: {
    splashImage?: string;
    splashVideo?: string;
    brandName?: string;
    brandIcon?: string;
    collectEnabled?: boolean;
    inStoreEnabled?: boolean;
    showSubcategories?: boolean;
    maxProductsPerPage?: number;
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
    };
  };
}

export interface SplashScreenData {
  backgroundImage?: string;
  backgroundVideo?: string;
  brandName: string;
  brandIcon: string;
  title: string;
  subtitle: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  roles?: string[];
}
