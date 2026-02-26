import type { CheckoutService, CheckoutData, Basket } from '../interfaces';

export class InMemoryCheckoutService implements CheckoutService {
  constructor(private platformConfig?: any) {}

  async createCheckout(_basket: Basket): Promise<string> {
    // Mock checkout creation
    const checkoutId = `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));

    return checkoutId;
  }

  async getCheckoutData(checkoutId: string): Promise<CheckoutData> {
    // Get available payment methods based on platform config
    let paymentMethods: any[] = [
      { type: 'cash', label: 'Cash Payment', icon: '💵' },
      { type: 'card', label: 'Card Payment', icon: '💳' },
    ]; // Default methods

    if (this.platformConfig?.paymentProcessor) {
      // In real implementation, would create service and get methods
      // For now, use default methods
    }

    return {
      id: checkoutId,
      paymentMethods,
      total: { amount: 0, currency: 'GBP' }, // Would get from actual basket
      currency: 'GBP',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    };
  }

  async getCheckoutStatus(checkoutId: string): Promise<any> {
    // Mock checkout status
    return {
      id: checkoutId,
      status: 'pending',
      basket: {}, // Would include basket details in real implementation
    };
  }

  async processPayment(_checkoutId: string, _paymentData: any): Promise<any> {
    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      orderId: `order_${Date.now()}`,
    };
  }

  async confirmOrder(orderId: string): Promise<any> {
    // Mock order confirmation
    return {
      id: orderId,
      status: 'confirmed',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };
  }
}
