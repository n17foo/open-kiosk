import type { CheckoutService, CheckoutData, Basket, PlatformConfig, OrderStatus } from '../interfaces';
import { buildOrderStatus, buildErrorOrderStatus } from '../utils/orderStatusHelpers';
import { PaymentServiceFactory } from '../payment';
import type { PaymentMethod } from '../payment';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('SquarespaceCheckoutService');

export class SquarespaceCheckoutService implements CheckoutService {
  constructor(
    private baseUrl: string,
    private accessToken: string,
    private platformConfig?: PlatformConfig
  ) {}

  async createCheckout(basket: Basket): Promise<string> {
    try {
      // Squarespace Commerce API: create an order directly
      const response = await this.makeRequest('commerce/orders', {
        method: 'POST',
        body: JSON.stringify({
          lineItems: basket.lines.map(line => ({
            productId: line.productId,
            quantity: line.qty,
          })),
          channelName: 'KIOSK',
          fulfillmentStatus: 'PENDING',
        }),
      });

      const orderId = response.id ?? response.orderNumber;
      if (!orderId) {
        throw new Error('Failed to create Squarespace order');
      }

      return String(orderId);
    } catch (error) {
      logger.error({ message: 'Failed to create Squarespace checkout' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    try {
      const response = await this.makeRequest(`commerce/orders/${checkoutId}`);

      let paymentMethods: PaymentMethod[] = [{ type: 'cash', label: 'Cash Payment', icon: '💵' }];

      if (this.platformConfig?.paymentProcessor) {
        const paymentService = PaymentServiceFactory.createService(
          this.platformConfig.paymentProcessor.type,
          this.platformConfig.paymentProcessor.config
        );
        paymentMethods = paymentService.getSupportedMethods();
      }

      const totalCents = response.grandTotal?.value
        ? Number(response.grandTotal.value)
        : Math.round(parseFloat(response.grandTotal ?? '0') * 100);
      const currency = response.grandTotal?.currency ?? 'GBP';

      return {
        id: checkoutId,
        paymentMethods,
        total: {
          amount: totalCents,
          currency,
        },
        currency,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    } catch (error) {
      logger.error({ message: 'Failed to get Squarespace checkout data' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`commerce/orders/${checkoutId}`);
      return {
        status: response.fulfillmentStatus ?? 'pending',
        paymentStatus: response.paymentStatus ?? null,
      };
    } catch (error) {
      logger.error({ message: 'Failed to get Squarespace checkout status' }, error instanceof Error ? error : new Error(String(error)));
      return { status: 'error' };
    }
  }

  async processPayment(checkoutId: string, _paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Update order fulfillment status
      await this.makeRequest(`commerce/orders/${checkoutId}/fulfillments`, {
        method: 'POST',
        body: JSON.stringify({
          shouldSendNotification: false,
        }),
      });

      return {
        success: true,
        orderId: checkoutId,
        transactionId: `sqsp_${Date.now()}`,
      };
    } catch (error) {
      logger.error({ message: 'Failed to process Squarespace payment' }, error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  async confirmOrder(orderId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`commerce/orders/${orderId}`);
      return {
        id: orderId,
        status: response.fulfillmentStatus ?? 'confirmed',
        orderNumber: response.orderNumber ?? orderId,
      };
    } catch (error) {
      logger.error({ message: 'Failed to confirm Squarespace order' }, error instanceof Error ? error : new Error(String(error)));
      return { id: orderId, status: 'confirmed' };
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest(`commerce/orders/${orderId}`);
      const status = response.fulfillmentStatus ?? 'PENDING';
      const phaseMap: Record<string, OrderStatus['phase']> = {
        PENDING: 'confirmed',
        FULFILLED: 'completed',
        CANCELED: 'cancelled',
      };
      return buildOrderStatus(orderId, phaseMap[status] ?? 'confirmed', response.modifiedOn);
    } catch (error) {
      logger.error({ message: 'Failed to get Squarespace order status' }, error instanceof Error ? error : new Error(String(error)));
      return buildErrorOrderStatus(orderId);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/1.0/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Squarespace API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
