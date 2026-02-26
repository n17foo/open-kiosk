import type { CheckoutService, CheckoutData, Basket } from '../interfaces';
import { OrderConverter } from '../order-converters';
import { PaymentServiceFactory } from '../payment';

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
    private platformConfig?: any
  ) {}

  async createCheckout(basket: Basket): Promise<string> {
    try {
      // Convert basket to WooCommerce order format
      const orderData = OrderConverter.toWooCommerceOrder(basket, 'woocommerce');

      const response = await this.makeRequest('orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const order: WooCommerceOrder = response;
      return order.id.toString();
    } catch (error) {
      console.error('Failed to create WooCommerce order:', error);
      throw new Error('Failed to create checkout');
    }
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    try {
      // Get order details
      const orderResponse = await this.makeRequest(`orders/${checkoutId}`);
      const order: WooCommerceOrder = orderResponse;

      // Get available payment methods based on platform config
      let paymentMethods: any[] = [{ type: 'cash', label: 'Cash Payment', icon: '💵' }]; // Default fallback

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
      console.error('Failed to get WooCommerce checkout data:', error);
      throw new Error('Failed to get checkout data');
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`orders/${checkoutId}`);
      const order: WooCommerceOrder = response;

      return {
        id: order.id.toString(),
        status: order.status,
        total: order.total,
        currency: order.currency,
      };
    } catch (error) {
      console.error('Failed to get WooCommerce order status:', error);
      return { status: 'unknown' };
    }
  }

  async processPayment(checkoutId: string, paymentData: any): Promise<any> {
    try {
      // Mark the order as paid
      const response = await this.makeRequest(`orders/${checkoutId}`, {
        method: 'PUT',
        body: JSON.stringify({
          set_paid: true,
          payment_method: paymentData.method || 'cash',
          payment_method_title: paymentData.methodTitle || 'Cash Payment',
        }),
      });

      const order: WooCommerceOrder = response;
      return {
        id: order.id.toString(),
        status: order.status,
        total: order.total,
      };
    } catch (error) {
      console.error('Failed to process WooCommerce payment:', error);
      throw new Error('Payment processing failed');
    }
  }

  async confirmOrder(orderId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      const order: WooCommerceOrder = response;
      return {
        id: order.id.toString(),
        status: order.status,
        total: order.total,
      };
    } catch (error) {
      console.error('Failed to confirm WooCommerce order:', error);
      return { id: orderId, status: 'error' };
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
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
