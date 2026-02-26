import type { CheckoutService, CheckoutData, Basket, PlatformConfig, OrderStatus } from '../interfaces';
import { buildOrderStatus, buildErrorOrderStatus } from '../utils/orderStatusHelpers';
import { PaymentServiceFactory } from '../payment';
import type { PaymentMethod } from '../payment';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SyliusCheckoutService');

export class SyliusCheckoutService implements CheckoutService {
  constructor(
    private baseUrl: string,
    private accessToken: string,
    private platformConfig?: PlatformConfig
  ) {}

  async createCheckout(_basket: Basket): Promise<string> {
    try {
      // In Sylius, the cart (order in cart state) IS the checkout
      // We transition it to the checkout state
      const response = await this.makeRequest('shop/orders', {
        method: 'POST',
        body: JSON.stringify({ localeCode: 'en_US' }),
      });

      return response.tokenValue ?? String(response.id);
    } catch (error) {
      logger.error({ message: 'Failed to create Sylius checkout' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    try {
      const response = await this.makeRequest(`shop/orders/${checkoutId}`);

      let paymentMethods: PaymentMethod[] = [{ type: 'cash', label: 'Cash Payment', icon: '💵' }];

      if (this.platformConfig?.paymentProcessor) {
        const paymentService = PaymentServiceFactory.createService(
          this.platformConfig.paymentProcessor.type,
          this.platformConfig.paymentProcessor.config
        );
        paymentMethods = paymentService.getSupportedMethods();
      }

      const currency = response.currencyCode ?? 'GBP';

      return {
        id: checkoutId,
        paymentMethods,
        total: {
          amount: response.total ?? 0,
          currency,
        },
        currency,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    } catch (error) {
      logger.error({ message: 'Failed to get Sylius checkout data' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`shop/orders/${checkoutId}`);
      return {
        status: response.checkoutState ?? response.state ?? 'pending',
        paymentState: response.paymentState ?? null,
      };
    } catch (error) {
      logger.error({ message: 'Failed to get Sylius checkout status' }, error instanceof Error ? error : new Error(String(error)));
      return { status: 'error' };
    }
  }

  async processPayment(checkoutId: string, paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Complete the checkout in Sylius
      await this.makeRequest(`shop/orders/${checkoutId}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({
          notes: paymentData.notes ?? '',
        }),
      });

      return {
        success: true,
        orderId: checkoutId,
        transactionId: `sylius_${Date.now()}`,
      };
    } catch (error) {
      logger.error({ message: 'Failed to process Sylius payment' }, error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  async confirmOrder(orderId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`shop/orders/${orderId}`);
      return {
        id: orderId,
        status: response.state ?? 'confirmed',
        orderNumber: response.number ?? orderId,
      };
    } catch (error) {
      logger.error({ message: 'Failed to confirm Sylius order' }, error instanceof Error ? error : new Error(String(error)));
      return { id: orderId, status: 'confirmed' };
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest(`shop/orders/${orderId}`);
      const state = response.state ?? 'new';
      const phaseMap: Record<string, OrderStatus['phase']> = {
        cart: 'pending',
        new: 'confirmed',
        fulfilled: 'ready',
        cancelled: 'cancelled',
        completed: 'completed',
      };
      const paymentState = response.paymentState;
      if (paymentState === 'refunded') return buildOrderStatus(orderId, 'refunded', response.updatedAt);
      return buildOrderStatus(orderId, phaseMap[state] ?? 'confirmed', response.updatedAt);
    } catch (error) {
      logger.error({ message: 'Failed to get Sylius order status' }, error instanceof Error ? error : new Error(String(error)));
      return buildErrorOrderStatus(orderId);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const contentType = options.method === 'PATCH' ? 'application/merge-patch+json' : 'application/ld+json';

    const response = await fetch(`${this.baseUrl}/api/v2/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': contentType,
        Accept: 'application/ld+json',
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Sylius API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
