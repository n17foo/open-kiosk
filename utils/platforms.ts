export enum ECommercePlatform {
  SHOPIFY = 'shopify',
  WOOCOMMERCE = 'woocommerce',
  MAGENTO = 'magento',
  BIGCOMMERCE = 'bigcommerce',
  SYLIUS = 'sylius',
  WIX = 'wix',
  PRESTASHOP = 'prestashop',
  SQUARESPACE = 'squarespace',
  OFFLINE = 'offline',
}

export const DEFAULT_PLATFORM = ECommercePlatform.OFFLINE;

export function isOnlinePlatform(platform: ECommercePlatform): boolean {
  return platform !== ECommercePlatform.OFFLINE;
}

export const PLATFORM_DISPLAY_NAMES: Readonly<Record<ECommercePlatform, string>> = {
  [ECommercePlatform.SHOPIFY]: 'Shopify',
  [ECommercePlatform.WOOCOMMERCE]: 'WooCommerce',
  [ECommercePlatform.MAGENTO]: 'Magento',
  [ECommercePlatform.BIGCOMMERCE]: 'BigCommerce',
  [ECommercePlatform.SYLIUS]: 'Sylius',
  [ECommercePlatform.WIX]: 'Wix',
  [ECommercePlatform.PRESTASHOP]: 'PrestaShop',
  [ECommercePlatform.SQUARESPACE]: 'Squarespace',
  [ECommercePlatform.OFFLINE]: 'Offline',
};

export function getPlatformDisplayName(platform?: ECommercePlatform | string | null): string {
  if (!platform) return PLATFORM_DISPLAY_NAMES[DEFAULT_PLATFORM];
  const key = platform as ECommercePlatform;
  return PLATFORM_DISPLAY_NAMES[key] ?? platform;
}
