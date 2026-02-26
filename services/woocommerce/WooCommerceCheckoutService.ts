import type { CheckoutService, CheckoutData, Basket, PlatformConfig, OrderStatus } from '../interfaces';
import { buildOrderStatus, buildErrorOrderStatus } from '../utils/orderStatusHelpers';
import { OrderConverter } from '../order-converters';
import { PaymentServiceFactory } from '../payment';
import type { PaymentMethod } from '../payment';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('WooCommerceCheckoutService');

interface WooCommerceOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  line_items: Array<{
    product_id: number;
    name: string;
    quantity: number;
    total: string;
  }>;
}

export class WooCommerceCheckoutService implements CheckoutService {
  constructor(
    private baseUrl: string,
    private consumerKey: string,
    private consumerSecret: string,
    private platformConfig?: PlatformConfig
  ) {}

  async createCheckout(basket: Basket): Promise<string> {
    try {
      // Convert basket to WooCommerce order format
      const orderData = OrderConverter.toWooCommerceOrder(basket, 'woocommerce');

      const response = await this.makeRequest('orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const order = response as WooCommerceOrder;
      return order.id.toString();
    } catch (error) {
      logger.error({ message: 'Failed to create WooCommerce order' }, error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to create checkout');
    }
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    try {
      // Get order details
      const orderResponse = (await this.makeRequest(`orders/${checkoutId}`)) as WooCommerceOrder;
      const order = orderResponse;

      // Get available payment methods based on platform config
      let paymentMethods: PaymentMethod[] = [{ type: 'cash', label: 'Cash Payment', icon: '💵' }];

      if (this.platformConfig?.paymentProcessor) {
        const paymentService = PaymentServiceFactory.createService(
          this.platformConfig.paymentProcessor.type,
          this.platformConfig.paymentProcessor.config
        );
        paymentMethods = paymentService.getSupportedMethods();
      }

      return {
        id: checkoutId,
        url: `${this.baseUrl}/checkout/order-pay/${checkoutId}`,
        paymentMethods,
        total: { amount: parseFloat(order.total) * 100, currency: 'GBP' }, // Convert to cents
        currency: order.currency,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      };
    } catch (error) {
      logger.error({ message: 'Failed to get WooCommerce checkout data' }, error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to get checkout data');
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<Record<string, unknown>> {
    try {
      const response = (await this.makeRequest(`orders/${checkoutId}`)) as WooCommerceOrder;
      const order = response;

      return {
        id: order.id.toString(),
        status: order.status,
        total: order.total,
        currency: order.currency,
      };
    } catch (error) {
      logger.error({ message: 'Failed to get WooCommerce order status' }, error instanceof Error ? error : new Error(String(error)));
      return { status: 'unknown' };
    }
  }

  async processPayment(checkoutId: string, paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Mark the order as paid
      const response = await this.makeRequest(`orders/${checkoutId}`, {
        method: 'PUT',
        body: JSON.stringify({
          set_paid: true,
          payment_method: (paymentData.method as string) || 'cash',
          payment_method_title: (paymentData.methodTitle as string) || 'Cash Payment',
        }),
      });

      const order = response as WooCommerceOrder;
      return {
        id: order.id.toString(),
        status: order.status,
        total: order.total,
      };
    } catch (error) {
      logger.error({ message: 'Failed to process WooCommerce payment' }, error instanceof Error ? error : new Error(String(error)));
      throw new Error('Payment processing failed');
    }
  }

  async confirmOrder(orderId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      const order = response as WooCommerceOrder;
      return {
        id: order.id.toString(),
        status: order.status,
        total: order.total,
      };
    } catch (error) {
      logger.error({ message: 'Failed to confirm WooCommerce order' }, error instanceof Error ? error : new Error(String(error)));
      return { id: orderId, status: 'error' };
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = (await this.makeRequest(`orders/${orderId}`)) as WooCommerceOrder;
      const status = response.status ?? 'pending';
      const phaseMap: Record<string, OrderStatus['phase']> = {
        pending: 'pending',
        processing: 'confirmed',
        'on-hold': 'pending',
        completed: 'completed',
        cancelled: 'cancelled',
        refunded: 'refunded',
        failed: 'error',
      };
      return buildOrderStatus(orderId, phaseMap[status] ?? 'confirmed');
    } catch (error) {
      logger.error({ message: 'Failed to get WooCommerce order status' }, error instanceof Error ? error : new Error(String(error)));
      return buildErrorOrderStatus(orderId);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const url = `${this.baseUrl}/wp-json/wc/v3/${endpoint}`;
    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
