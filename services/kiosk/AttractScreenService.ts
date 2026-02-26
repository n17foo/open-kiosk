import { LoggerFactory } from '../logger/LoggerFactory';
import { kioskConfigService } from './KioskConfigService';

export interface AttractScreenContent {
  type: 'image' | 'video' | 'default';
  url: string;
  brandName: string;
  brandIcon: string;
}

export class AttractScreenService {
  private static instance: AttractScreenService;
  private logger = LoggerFactory.getInstance().createLogger('AttractScreenService');

  private constructor() {}

  static getInstance(): AttractScreenService {
    if (!AttractScreenService.instance) {
      AttractScreenService.instance = new AttractScreenService();
    }
    return AttractScreenService.instance;
  }

  getContent(): AttractScreenContent {
    const config = kioskConfigService.getConfig();

    if (config.attractVideoUrl) {
      this.logger.debug('Returning video attract screen content');
      return {
        type: 'video',
        url: config.attractVideoUrl,
        brandName: config.brandName,
        brandIcon: config.brandIcon,
      };
    }

    if (config.attractScreenUrl) {
      this.logger.debug('Returning image attract screen content');
      return {
        type: 'image',
        url: config.attractScreenUrl,
        brandName: config.brandName,
        brandIcon: config.brandIcon,
      };
    }

    return {
      type: 'default',
      url: '',
      brandName: config.brandName,
      brandIcon: config.brandIcon,
    };
  }
}

export const attractScreenService = AttractScreenService.getInstance();
