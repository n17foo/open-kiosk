import type { CheckoutService, CheckoutData, Basket, PlatformConfig, OrderStatus, OrderStatusPhase } from '../interfaces';
import { buildOrderStatus, buildErrorOrderStatus } from '../utils/orderStatusHelpers';
import { PaymentServiceFactory } from '../payment';
import type { PaymentMethod } from '../payment';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('BigCommerceCheckoutService');

export class BigCommerceCheckoutService implements CheckoutService {
  constructor(
    private baseUrl: string,
    private accessToken: string,
    private platformConfig?: PlatformConfig
  ) {}

  async createCheckout(basket: Basket): Promise<string> {
    try {
      // BigCommerce: convert cart to checkout
      // The cart ID is used as the checkout ID in BigCommerce
      const response = await this.makeRequest('checkouts', {
        method: 'POST',
        body: JSON.stringify({
          line_items: basket.lines.map(line => ({
            product_id: Number(line.productId),
            quantity: line.qty,
          })),
        }),
      });

      const checkoutId = response.data?.id;
      if (!checkoutId) {
        throw new Error('Failed to create BigCommerce checkout');
      }

      return String(checkoutId);
    } catch (error) {
      logger.error({ message: 'Failed to create BigCommerce checkout' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    try {
      const response = await this.makeRequest(`checkouts/${checkoutId}`);
      const checkout = response.data;

      let paymentMethods: PaymentMethod[] = [{ type: 'cash', label: 'Cash Payment', icon: '💵' }];

      if (this.platformConfig?.paymentProcessor) {
        const paymentService = PaymentServiceFactory.createService(
          this.platformConfig.paymentProcessor.type,
          this.platformConfig.paymentProcessor.config
        );
        paymentMethods = paymentService.getSupportedMethods();
      }

      const currency = checkout?.cart?.currency?.code ?? 'GBP';

      return {
        id: checkoutId,
        paymentMethods,
        total: {
          amount: Math.round((checkout?.grand_total ?? 0) * 100),
          currency,
        },
        currency,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    } catch (error) {
      logger.error({ message: 'Failed to get BigCommerce checkout data' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`checkouts/${checkoutId}`);
      return {
        status: response.data?.status ?? 'pending',
        orderId: response.data?.order_id ?? null,
      };
    } catch (error) {
      logger.error({ message: 'Failed to get BigCommerce checkout status' }, error instanceof Error ? error : new Error(String(error)));
      return { status: 'error' };
    }
  }

  async processPayment(checkoutId: string, paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Create order from checkout first
      const orderResponse = await this.makeRequest(`checkouts/${checkoutId}/orders`, {
        method: 'POST',
      });

      const orderId = orderResponse.data?.id;

      // Then process payment via BigCommerce Payments API
      const paymentResponse = await this.makeRequest(`payments`, {
        method: 'POST',
        body: JSON.stringify({
          payment: {
            instrument: paymentData,
            payment_method_id: paymentData.methodId ?? 'cash',
          },
        }),
      });

      return {
        success: true,
        orderId: String(orderId),
        transactionId: paymentResponse.data?.id ?? `bc_${Date.now()}`,
      };
    } catch (error) {
      logger.error({ message: 'Failed to process BigCommerce payment' }, error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  async confirmOrder(orderId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`orders/${orderId}`);
      return {
        id: orderId,
        status: response.data?.status ?? 'confirmed',
        orderNumber: response.data?.id ?? orderId,
      };
    } catch (error) {
      logger.error({ message: 'Failed to confirm BigCommerce order' }, error instanceof Error ? error : new Error(String(error)));
      return { id: orderId, status: 'confirmed' };
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest(`orders/${orderId}`);
      const statusId: number = response.data?.status_id ?? 0;
      const phaseMap: Record<number, OrderStatusPhase> = {
        0: 'pending',
        7: 'pending',
        12: 'pending',
        1: 'confirmed',
        11: 'preparing',
        2: 'ready',
        3: 'ready',
        10: 'completed',
        5: 'cancelled',
      };
      return buildOrderStatus(orderId, phaseMap[statusId] ?? 'confirmed', response.data?.date_modified);
    } catch (error) {
      logger.error({ message: 'Failed to get BigCommerce order status' }, error instanceof Error ? error : new Error(String(error)));
      return buildErrorOrderStatus(orderId);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v3/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': this.accessToken,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`BigCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
