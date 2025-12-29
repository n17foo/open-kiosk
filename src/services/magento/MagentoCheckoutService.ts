import type { CheckoutService, CheckoutData, Basket } from '../interfaces';
import { PaymentServiceFactory } from '../payment';

interface MagentoCart {
  id: string;
  items: Array<{
    item_id: number;
    sku: string;
    qty: number;
    name: string;
    price: number;
    product_type: string;
  }>;
  totals: {
    grand_total: number;
    base_grand_total: number;
    subtotal: number;
    taxes: Array<{
      amount: number;
      title: string;
    }>;
  };
}

interface MagentoOrder {
  entity_id: number;
  increment_id: string;
  status: string;
  grand_total: number;
  created_at: string;
  items: Array<{
    item_id: number;
    order_id: number;
    sku: string;
    name: string;
    qty_ordered: number;
    price: number;
  }>;
}

export class MagentoCheckoutService implements CheckoutService {
  private cartId: string | null = null;

  constructor(private baseUrl: string, private accessToken: string, private platformConfig?: any) {}

  async createCheckout(basket: Basket): Promise<string> {
    try {
      // Create a guest cart
      const cartResponse = await this.makeRequest('guest-carts', { method: 'POST' });
      const cartId = cartResponse;

      this.cartId = cartId;

      // Add items to cart
      for (const line of basket.lines) {
        await this.makeRequest(`guest-carts/${cartId}/items`, {
          method: 'POST',
          body: JSON.stringify({
            cart_item: {
              sku: line.productId, // Assuming SKU is stored as productId, may need adjustment
              qty: line.qty,
              quote_id: cartId,
            },
          }),
        });
      }

      return cartId;
    } catch (error) {
      console.error('Failed to create Magento cart:', error);
      throw new Error('Failed to create checkout');
    }
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    try {
      // Get cart totals
      const totalsResponse = await this.makeRequest(`guest-carts/${checkoutId}/totals`);
      const totals: MagentoCart['totals'] = totalsResponse;

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
        total: { amount: Math.round(totals.grand_total * 100), currency: 'GBP' }, // Convert to cents
        currency: 'GBP',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      };
    } catch (error) {
      console.error('Failed to get Magento checkout data:', error);
      throw new Error('Failed to get checkout data');
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`guest-carts/${checkoutId}/totals`);
      const totals: MagentoCart['totals'] = response;

      return {
        id: checkoutId,
        status: 'pending',
        total: totals.grand_total,
        currency: 'GBP', // Assuming GBP
        subtotal: totals.subtotal,
        tax: totals.taxes?.reduce((sum, tax) => sum + tax.amount, 0) || 0,
      };
    } catch (error) {
      console.error('Failed to get Magento cart status:', error);
      return { status: 'unknown' };
    }
  }

  async processPayment(checkoutId: string, paymentData: any): Promise<any> {
    try {
      // Set payment method
      await this.makeRequest(`guest-carts/${checkoutId}/payment-information`, {
        method: 'POST',
        body: JSON.stringify({
          paymentMethod: {
            method: paymentData.method || 'cashondelivery',
          },
          billing_address: {
            email: 'kiosk@example.com',
            firstname: 'Kiosk',
            lastname: 'Customer',
            street: ['Kiosk Address'],
            city: 'Kiosk City',
            postcode: '00000',
            country_id: 'GB',
            telephone: '0000000000',
          },
        }),
      });

      // This creates the order
      const orderResponse = await this.makeRequest(`guest-carts/${checkoutId}/payment-information`, {
        method: 'POST',
        body: JSON.stringify({
          paymentMethod: {
            method: paymentData.method || 'cashondelivery',
          },
        }),
      });

      const order: MagentoOrder = orderResponse;

      return {
        id: order.increment_id,
        status: order.status,
        total: order.grand_total,
      };
    } catch (error) {
      console.error('Failed to process Magento payment:', error);
      throw new Error('Payment processing failed');
    }
  }

  async confirmOrder(orderId: string): Promise<any> {
    try {
      // Magento orders are confirmed upon creation, but we can check status
      const response = await this.makeRequest(`orders/${orderId}`);
      const order: MagentoOrder = response;

      return {
        id: order.increment_id,
        status: order.status,
        total: order.grand_total,
      };
    } catch (error) {
      console.error('Failed to confirm Magento order:', error);
      return { id: orderId, status: 'error' };
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/rest/V1/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Magento API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
