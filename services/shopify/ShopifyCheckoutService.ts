import type { CheckoutService, CheckoutData, OrderStatus } from '../interfaces';
import { buildOrderStatus, buildErrorOrderStatus } from '../utils/orderStatusHelpers';
import { PaymentServiceFactory } from '../payment';

export class ShopifyCheckoutService implements CheckoutService {
  constructor(
    private baseUrl: string,
    private accessToken: string,
    private platformConfig?: any
  ) {}

  async createCheckout(_basket: any): Promise<string> {
    // TODO: Create Shopify checkout
    throw new Error('Shopify checkout creation not yet implemented');
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
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
      paymentMethods,
      total: { amount: 0, currency: 'GBP' }, // Would get from actual checkout
      currency: 'GBP',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    };
  }

  async getCheckoutStatus(_checkoutId: string): Promise<any> {
    // TODO: Get checkout status
    return { status: 'pending' };
  }

  async processPayment(_checkoutId: string, _paymentData: any): Promise<any> {
    // TODO: Process payment
    throw new Error('Shopify payment processing not yet implemented');
  }

  async confirmOrder(orderId: string): Promise<any> {
    // TODO: Confirm order
    return { id: orderId, status: 'confirmed' };
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      // Shopify Admin API: orders/{id}.json
      const response = await fetch(`${this.baseUrl}/api/2023-10/orders/${orderId}.json`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.accessToken,
        },
      });
      if (!response.ok) throw new Error(`Shopify API error: ${response.status}`);
      const data = await response.json();
      const order = data.order;
      const fulfillment = order?.fulfillment_status;
      const financial = order?.financial_status;
      const phaseMap: Record<string, OrderStatus['phase']> = {
        null: 'confirmed',
        unshipped: 'confirmed',
        partial: 'preparing',
        fulfilled: 'completed',
      };
      if (order?.cancelled_at) return buildOrderStatus(orderId, 'cancelled', order.updated_at);
      if (financial === 'refunded') return buildOrderStatus(orderId, 'refunded', order.updated_at);
      return buildOrderStatus(orderId, phaseMap[fulfillment ?? 'null'] ?? 'confirmed', order?.updated_at);
    } catch {
      return buildErrorOrderStatus(orderId);
    }
  }
}
