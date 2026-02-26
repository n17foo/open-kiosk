import { LoggerFactory } from '../logger/LoggerFactory';
import { keyValueRepository } from '../../repositories/KeyValueRepository';

export interface KioskConfig {
  idleTimeoutMs: number;
  attractScreenUrl: string;
  attractVideoUrl: string;
  allowedCategories: string[];
  receiptDelivery: 'print' | 'email' | 'sms' | 'none';
  showSubcategories: boolean;
  maxProductsPerPage: number;
  brandName: string;
  brandIcon: string;
  primaryColor: string;
  secondaryColor: string;
  touchTargetMinSize: number;
  largeFontMode: boolean;
}

const DEFAULT_KIOSK_CONFIG: KioskConfig = {
  idleTimeoutMs: 120_000,
  attractScreenUrl: '',
  attractVideoUrl: '',
  allowedCategories: [],
  receiptDelivery: 'print',
  showSubcategories: true,
  maxProductsPerPage: 12,
  brandName: 'OpenKiosk',
  brandIcon: '',
  primaryColor: '#2196F3',
  secondaryColor: '#FF9800',
  touchTargetMinSize: 48,
  largeFontMode: false,
};

const KIOSK_CONFIG_KEY = 'kioskConfig';

export class KioskConfigService {
  private static instance: KioskConfigService;
  private logger = LoggerFactory.getInstance().createLogger('KioskConfigService');
  private config: KioskConfig = { ...DEFAULT_KIOSK_CONFIG };

  private constructor() {}

  static getInstance(): KioskConfigService {
    if (!KioskConfigService.instance) {
      KioskConfigService.instance = new KioskConfigService();
    }
    return KioskConfigService.instance;
  }

  async load(): Promise<KioskConfig> {
    try {
      const saved = await keyValueRepository.getObject<KioskConfig>(KIOSK_CONFIG_KEY);
      if (saved) {
        this.config = { ...DEFAULT_KIOSK_CONFIG, ...saved };
      }
      this.logger.info('Kiosk config loaded');
    } catch (err) {
      this.logger.error({ message: 'Failed to load kiosk config' }, err instanceof Error ? err : new Error(String(err)));
    }
    return this.getConfig();
  }

  getConfig(): KioskConfig {
    return { ...this.config };
  }

  async update(updates: Partial<KioskConfig>): Promise<KioskConfig> {
    this.config = { ...this.config, ...updates };
    await keyValueRepository.setObject(KIOSK_CONFIG_KEY, this.config);
    this.logger.info('Kiosk config updated');
    return this.getConfig();
  }

  async reset(): Promise<KioskConfig> {
    this.config = { ...DEFAULT_KIOSK_CONFIG };
    await keyValueRepository.setObject(KIOSK_CONFIG_KEY, this.config);
    this.logger.info('Kiosk config reset to defaults');
    return this.getConfig();
  }

  getDefaults(): KioskConfig {
    return { ...DEFAULT_KIOSK_CONFIG };
  }
}

export const kioskConfigService = KioskConfigService.getInstance();
