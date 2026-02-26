import type { CheckoutService, CheckoutData, Basket, PlatformConfig, OrderStatus } from '../interfaces';
import { buildOrderStatus, buildErrorOrderStatus } from '../utils/orderStatusHelpers';
import { PaymentServiceFactory } from '../payment';
import type { PaymentMethod } from '../payment';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('WixCheckoutService');

export class WixCheckoutService implements CheckoutService {
  constructor(
    private baseUrl: string,
    private apiKey: string,
    private platformConfig?: PlatformConfig
  ) {}

  async createCheckout(basket: Basket): Promise<string> {
    try {
      const response = await this.makeRequest('ecom/v1/checkouts', {
        method: 'POST',
        body: JSON.stringify({
          lineItems: basket.lines.map(line => ({
            catalogReference: {
              catalogItemId: line.productId,
              appId: '1380b703-ce81-ff05-f115-39571d94dfcd',
            },
            quantity: line.qty,
          })),
          channelType: 'POS',
        }),
      });

      const checkoutId = response.checkout?.id;
      if (!checkoutId) {
        throw new Error('Failed to create Wix checkout');
      }

      return checkoutId;
    } catch (error) {
      logger.error({ message: 'Failed to create Wix checkout' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    try {
      const response = await this.makeRequest(`ecom/v1/checkouts/${checkoutId}`);
      const checkout = response.checkout;

      let paymentMethods: PaymentMethod[] = [{ type: 'cash', label: 'Cash Payment', icon: '💵' }];

      if (this.platformConfig?.paymentProcessor) {
        const paymentService = PaymentServiceFactory.createService(
          this.platformConfig.paymentProcessor.type,
          this.platformConfig.paymentProcessor.config
        );
        paymentMethods = paymentService.getSupportedMethods();
      }

      const currency = checkout?.currency ?? 'GBP';
      const totalAmount = parseFloat(checkout?.priceSummary?.total?.amount ?? '0');

      return {
        id: checkoutId,
        paymentMethods,
        total: {
          amount: Math.round(totalAmount * 100),
          currency,
        },
        currency,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    } catch (error) {
      logger.error({ message: 'Failed to get Wix checkout data' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`ecom/v1/checkouts/${checkoutId}`);
      return {
        status: response.checkout?.completed ? 'completed' : 'pending',
      };
    } catch (error) {
      logger.error({ message: 'Failed to get Wix checkout status' }, error instanceof Error ? error : new Error(String(error)));
      return { status: 'error' };
    }
  }

  async processPayment(checkoutId: string, _paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Create an order from the checkout
      const response = await this.makeRequest('ecom/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          checkoutId,
          paymentStatus: 'PAID',
        }),
      });

      return {
        success: true,
        orderId: response.order?.id ?? checkoutId,
        transactionId: `wix_${Date.now()}`,
      };
    } catch (error) {
      logger.error({ message: 'Failed to process Wix payment' }, error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  async confirmOrder(orderId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`ecom/v1/orders/${orderId}`);
      return {
        id: orderId,
        status: response.order?.status ?? 'confirmed',
        orderNumber: response.order?.number ?? orderId,
      };
    } catch (error) {
      logger.error({ message: 'Failed to confirm Wix order' }, error instanceof Error ? error : new Error(String(error)));
      return { id: orderId, status: 'confirmed' };
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest(`ecom/v1/orders/${orderId}`);
      const status = response.order?.status ?? response.order?.paymentStatus ?? 'INITIALIZED';
      const phaseMap: Record<string, OrderStatus['phase']> = {
        INITIALIZED: 'pending',
        APPROVED: 'confirmed',
        FULFILLED: 'ready',
        NOT_FULFILLED: 'preparing',
        CANCELED: 'cancelled',
        REFUNDED: 'refunded',
      };
      return buildOrderStatus(orderId, phaseMap[status] ?? 'confirmed', response.order?.updatedDate);
    } catch (error) {
      logger.error({ message: 'Failed to get Wix order status' }, error instanceof Error ? error : new Error(String(error)));
      return buildErrorOrderStatus(orderId);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
