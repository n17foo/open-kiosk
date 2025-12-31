import type { CmsService, SplashScreenData } from './interfaces';

export class GenericCmsService implements CmsService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getSplashScreenData(): Promise<SplashScreenData> {
    try {
      const url = `${this.baseUrl}/api/cms/splash-screen`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the response structure
      if (!data.brandName || !data.brandIcon || !data.title || !data.subtitle) {
        throw new Error('Invalid splash screen data structure');
      }

      return {
        backgroundImage: data.backgroundImage,
        backgroundVideo: data.backgroundVideo,
        brandName: data.brandName,
        brandIcon: data.brandIcon,
        title: data.title,
        subtitle: data.subtitle,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
      };
    } catch (error) {
      console.error('Failed to fetch splash screen data:', error);
      // Return fallback data if CMS is unavailable
      return this.getFallbackSplashData();
    }
  }

  private getFallbackSplashData(): SplashScreenData {
    return {
      backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      brandName: 'OpenKiosk',
      brandIcon: '🛍️',
      title: 'Shop. Browse. Discover.',
      subtitle: 'Find what you\'re looking for with just a few taps',
    };
  }
}

export class MockCmsService implements CmsService {
  async getSplashScreenData(): Promise<SplashScreenData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      brandName: 'OpenKiosk',
      brandIcon: '🛍️',
      title: 'Shop. Browse. Discover.',
      subtitle: 'Find what you\'re looking for with just a few taps',
      primaryColor: '#FFFFFF', // White text for main content
      secondaryColor: '#F5F5F5', // Light gray for secondary text
    };
  }
}
