import type { PlatformType } from './types';

// Extended Money type that supports multiple currencies
export interface ExtendedMoney {
  amount: number;
  currency: string; // Flexible currency support
}

// Extended internal types that can hold platform-specific data
export interface ExtendedProduct {
  // Core kiosk fields
  id: string;
  name: string;
  description?: string;
  price: ExtendedMoney;
  image?: string;
  categoryIds: string[]; // Multiple categories

  // Extended fields for platform compatibility
  regularPrice?: ExtendedMoney;
  salePrice?: ExtendedMoney;
  status?: 'active' | 'inactive' | 'draft';
  images?: string[]; // Multiple images
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };

  // Platform-specific metadata
  platformData: Partial<Record<PlatformType, any>>;

  // Variants support
  hasVariants?: boolean;
  variants?: ExtendedProductVariant[];
}

export interface ExtendedProductVariant {
  id: string;
  productId: string;
  name: string;
  price: ExtendedMoney;
  regularPrice?: ExtendedMoney;
  salePrice?: ExtendedMoney;
  sku?: string;
  image?: string;
  options: Record<string, string>; // e.g., { size: 'M', color: 'red' }
  platformData: Partial<Record<PlatformType, any>>;
}

export interface ExtendedCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: ExtendedCategory[];
  platformData: Partial<Record<PlatformType, any>>;
}

// Re-export existing types for convenience
export type {
  Money,
  Category,
  Product,
  Basket,
  BasketLine,
  KioskCatalog,
  PlatformType,
  PlatformConfig,
} from './types';

// Platform-specific data interfaces
export interface WooCommerceProductData {
  id: number;
  name: string;
  description: string;
  short_description: string;
  images: Array<{ src: string; alt?: string }>;
  regular_price: string;
  sale_price?: string;
  price: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  status: 'publish' | 'draft' | 'pending' | 'private';
  sku?: string;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  tags?: Array<{ id: number; name: string; slug: string }>;
  variations?: number[];
}

export interface WooCommerceCategoryData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: { src: string };
  parent?: number;
}

export interface ShopifyProductData {
  id: string;
  title: string;
  description: string;
  images: { edges: Array<{ node: { url: string; altText?: string } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        compareAtPrice?: { amount: string; currencyCode: string };
        sku?: string;
        weight?: number;
        weightUnit?: string;
        selectedOptions: Array<{ name: string; value: string }>;
      }
    }>
  };
  collections: { edges: Array<{ node: { id: string; title: string } }> };
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  tags: string[];
}

export interface ShopifyCollectionData {
  id: string;
  title: string;
  description?: string;
  image?: { url: string };
}

export interface MagentoProductData {
  id: number;
  sku: string;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  special_price?: number;
  special_from_date?: string;
  special_to_date?: string;
  status: number; // 1 = enabled, 2 = disabled
  visibility: number;
  type_id: string;
  weight?: number;
  custom_attributes: Array<{
    attribute_code: string;
    value: string | number | boolean;
  }>;
  media_gallery_entries?: Array<{
    id: number;
    media_type: string;
    file: string;
    label?: string;
  }>;
  category_links?: Array<{
    category_id: string;
    position?: number;
  }>;
}

export interface MagentoCategoryData {
  id: number;
  name: string;
  description?: string;
  image?: string;
  parent_id: number;
  is_active: boolean;
  level: number;
  children?: string;
}
