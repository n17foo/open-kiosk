import type { CheckoutService, CheckoutData, Basket, PlatformConfig, OrderStatus } from '../interfaces';
import { buildOrderStatus, buildErrorOrderStatus } from '../utils/orderStatusHelpers';
import { PaymentServiceFactory } from '../payment';
import type { PaymentMethod } from '../payment';
import { LoggerFactory } from '../logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('PrestaShopCheckoutService');

export class PrestaShopCheckoutService implements CheckoutService {
  constructor(
    private baseUrl: string,
    private apiKey: string,
    private platformConfig?: PlatformConfig
  ) {}

  async createCheckout(basket: Basket): Promise<string> {
    try {
      // PrestaShop: create an order from the cart
      const orderXml = this.buildOrderXml(basket);
      const response = await this.makeRequest('orders', {
        method: 'POST',
        body: orderXml,
        headers: { 'Content-Type': 'text/xml' },
      });

      const orderId = response.order?.id;
      if (!orderId) {
        throw new Error('Failed to create PrestaShop order');
      }

      return String(orderId);
    } catch (error) {
      logger.error({ message: 'Failed to create PrestaShop checkout' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    try {
      const response = await this.makeRequest(`orders/${checkoutId}?display=full`);
      const order = response.order;

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
        paymentMethods,
        total: {
          amount: Math.round(parseFloat(order?.total_paid ?? '0') * 100),
          currency: 'GBP',
        },
        currency: 'GBP',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    } catch (error) {
      logger.error({ message: 'Failed to get PrestaShop checkout data' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`orders/${checkoutId}?display=full`);
      return {
        status: response.order?.current_state ?? 'pending',
        orderId: checkoutId,
      };
    } catch (error) {
      logger.error({ message: 'Failed to get PrestaShop checkout status' }, error instanceof Error ? error : new Error(String(error)));
      return { status: 'error' };
    }
  }

  async processPayment(checkoutId: string, _paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Update order state to "payment accepted" (state 2 in PrestaShop)
      await this.makeRequest(`orders/${checkoutId}`, {
        method: 'PUT',
        body: `<?xml version="1.0" encoding="UTF-8"?><prestashop><order><id>${checkoutId}</id><current_state>2</current_state></order></prestashop>`,
        headers: { 'Content-Type': 'text/xml' },
      });

      return {
        success: true,
        orderId: checkoutId,
        transactionId: `ps_${Date.now()}`,
      };
    } catch (error) {
      logger.error({ message: 'Failed to process PrestaShop payment' }, error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  async confirmOrder(orderId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`orders/${orderId}?display=full`);
      return {
        id: orderId,
        status: 'confirmed',
        orderNumber: response.order?.reference ?? orderId,
      };
    } catch (error) {
      logger.error({ message: 'Failed to confirm PrestaShop order' }, error instanceof Error ? error : new Error(String(error)));
      return { id: orderId, status: 'confirmed' };
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest(`orders/${orderId}?display=full`);
      const stateId = Number(response.order?.current_state ?? 0);
      // PrestaShop default states: 1=Awaiting check, 2=Payment accepted, 3=Processing,
      // 4=Shipped, 5=Delivered, 6=Cancelled, 7=Refunded, 8=Payment error
      const phaseMap: Record<number, OrderStatus['phase']> = {
        1: 'pending',
        2: 'confirmed',
        3: 'preparing',
        4: 'ready',
        5: 'completed',
        6: 'cancelled',
        7: 'refunded',
        8: 'error',
      };
      return buildOrderStatus(orderId, phaseMap[stateId] ?? 'confirmed', response.order?.date_upd);
    } catch (error) {
      logger.error({ message: 'Failed to get PrestaShop order status' }, error instanceof Error ? error : new Error(String(error)));
      return buildErrorOrderStatus(orderId);
    }
  }

  private buildOrderXml(basket: Basket): string {
    const rows = basket.lines
      .map(line => `<order_row><product_id>${line.productId}</product_id><product_quantity>${line.qty}</product_quantity></order_row>`)
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?><prestashop><order><id_cart>0</id_cart><id_currency>1</id_currency><id_lang>1</id_lang><id_customer>0</id_customer><id_carrier>0</id_carrier><payment>Kiosk Payment</payment><module>kiosk</module><total_paid>${(basket.total.amount / 100).toFixed(2)}</total_paid><total_paid_real>${(basket.total.amount / 100).toFixed(2)}</total_paid_real><associations><order_rows>${rows}</order_rows></associations></order></prestashop>`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const auth = btoa(`${this.apiKey}:`);
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}/api/${endpoint}${separator}output_format=JSON`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`PrestaShop API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
