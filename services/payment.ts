import type { Money } from './types';
import { LoggerFactory } from './logger/LoggerFactory';

const logger = LoggerFactory.getInstance().createLogger('PaymentService');

export interface PaymentMethod {
  type: 'card' | 'cash' | 'apple_pay' | 'google_pay';
  label: string;
  icon: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  amount: Money;
  method: PaymentMethod;
}

export interface PaymentData {
  method: PaymentMethod;
  amount: Money;
  currency: string;
  orderId?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
}

export interface PaymentService {
  getSupportedMethods(): PaymentMethod[];
  processPayment(data: PaymentData): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: Money): Promise<PaymentResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentResult>;
  // PED-specific methods
  initializeTerminal?(): Promise<boolean>;
  getTerminalStatus?(): Promise<{ connected: boolean; status: string; batteryLevel?: number; lastTransaction?: string }>;
  detectCard?(): Promise<{ detected: boolean; cardType?: string }>;
  readCard?(): Promise<{ success: boolean; cardData?: any; error?: string }>;
  promptPin?(amount: Money): Promise<{ success: boolean; pinEntered?: boolean; error?: string }>;
  completeTransaction?(): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  cancelTransaction?(): Promise<boolean>;
}

// Square Terminal API implementation
export class SquarePaymentService implements PaymentService {
  constructor(
    private applicationId: string,
    private accessToken: string,
    private locationId: string
  ) {}

  getSupportedMethods(): PaymentMethod[] {
    return [
      { type: 'card', label: 'Card via Square Terminal', icon: '💳' },
      { type: 'cash', label: 'Cash', icon: '💵' },
    ];
  }

  async initializeTerminal(): Promise<boolean> {
    try {
      // In a real implementation, this would initialize the Square Terminal SDK
      // For now, simulate terminal connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.info('Square Terminal initialized');
      return true;
    } catch (error) {
      logger.error({ message: 'Failed to initialize Square Terminal' }, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  async getTerminalStatus(): Promise<{ connected: boolean; status: string; batteryLevel?: number; lastTransaction?: string }> {
    // Simulate checking terminal connection with more realistic data
    const connected = Math.random() > 0.05; // 95% connected

    return {
      connected,
      status: connected ? 'ready' : 'disconnected',
      batteryLevel: connected ? Math.floor(Math.random() * 40) + 60 : undefined, // 60-100%
      lastTransaction: connected ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined, // Within last hour
    };
  }

  async detectCard(): Promise<{ detected: boolean; cardType?: string }> {
    // Simulate card detection
    await new Promise(resolve => setTimeout(resolve, 500)); // Card detection delay

    const detected = Math.random() > 0.3; // 70% chance of card detection
    const cardTypes = ['visa', 'mastercard', 'amex', 'discover'];

    return {
      detected,
      cardType: detected ? cardTypes[Math.floor(Math.random() * cardTypes.length)] : undefined,
    };
  }

  async readCard(): Promise<{ success: boolean; cardData?: any; error?: string }> {
    // Simulate card reading
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      return {
        success: true,
        cardData: {
          lastFour: Math.floor(Math.random() * 9000) + 1000,
          expiryMonth: Math.floor(Math.random() * 12) + 1,
          expiryYear: new Date().getFullYear() + Math.floor(Math.random() * 5),
          cardholderName: 'JOHN DOE',
        },
      };
    } else {
      return {
        success: false,
        error: 'Card read failed - please try again',
      };
    }
  }

  async promptPin(_amount: Money): Promise<{ success: boolean; pinEntered?: boolean; error?: string }> {
    // Simulate PIN entry
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.15; // 85% success rate

    return {
      success,
      pinEntered: success,
      error: success ? undefined : 'PIN entry failed or cancelled',
    };
  }

  async completeTransaction(): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate transaction completion
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = Math.random() > 0.05; // 95% success rate

    return {
      success,
      transactionId: success ? `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined,
      error: success ? undefined : 'Transaction declined by issuer',
    };
  }

  async cancelTransaction(): Promise<boolean> {
    // Simulate transaction cancellation
    await new Promise(resolve => setTimeout(resolve, 500));
    return true; // Always successful
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      // Initialize terminal if needed
      const terminalReady = await this.initializeTerminal();
      if (!terminalReady) {
        return {
          success: false,
          error: 'Payment terminal not ready',
          amount: data.amount,
          method: data.method,
        };
      }

      // Simulate payment processing with Square Terminal
      await new Promise(resolve => setTimeout(resolve, 3000));

      const success = Math.random() > 0.05; // 95% success rate

      if (success) {
        return {
          success: true,
          transactionId: `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: data.amount,
          method: data.method,
        };
      } else {
        return {
          success: false,
          error: 'Payment declined by card issuer',
          amount: data.amount,
          method: data.method,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Square payment failed',
        amount: data.amount,
        method: data.method,
      };
    }
  }

  async refundPayment(transactionId: string, amount?: Money): Promise<PaymentResult> {
    try {
      // Implement Square refund logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        transactionId: `refund_${transactionId}`,
        amount: amount || { amount: 0, currency: 'GBP' },
        method: { type: 'card', label: 'Card', icon: '💳' },
      };
    } catch {
      return {
        success: false,
        error: 'Refund failed',
        amount: amount || { amount: 0, currency: 'GBP' },
        method: { type: 'card', label: 'Card', icon: '💳' },
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    // Implement status check
    return {
      success: true,
      transactionId,
      amount: { amount: 0, currency: 'GBP' },
      method: { type: 'card', label: 'Card', icon: '💳' },
    };
  }
}

// Adyen Terminal API implementation
export class AdyenPaymentService implements PaymentService {
  constructor(
    private apiKey: string,
    private merchantAccount: string,
    private terminalId?: string
  ) {}

  getSupportedMethods(): PaymentMethod[] {
    return [
      { type: 'card', label: 'Card via Adyen Terminal', icon: '💳' },
      { type: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
      { type: 'google_pay', label: 'Google Pay', icon: '🎯' },
      { type: 'cash', label: 'Cash', icon: '💵' },
    ];
  }

  async initializeTerminal(): Promise<boolean> {
    try {
      // In a real implementation, this would initialize the Adyen Terminal SDK
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.info('Adyen Terminal initialized');
      return true;
    } catch (error) {
      logger.error({ message: 'Failed to initialize Adyen Terminal' }, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  async getTerminalStatus(): Promise<{ connected: boolean; status: string; batteryLevel?: number; lastTransaction?: string }> {
    // Simulate checking terminal connection with more realistic data
    const connected = Math.random() > 0.05; // 95% connected

    return {
      connected,
      status: connected ? 'ready' : 'disconnected',
      batteryLevel: connected ? Math.floor(Math.random() * 40) + 60 : undefined, // 60-100%
      lastTransaction: connected ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined, // Within last hour
    };
  }

  async detectCard(): Promise<{ detected: boolean; cardType?: string }> {
    // Simulate card detection
    await new Promise(resolve => setTimeout(resolve, 600)); // Slightly different timing than Square

    const detected = Math.random() > 0.25; // 75% chance of card detection (better than Square)
    const cardTypes = ['visa', 'mastercard', 'amex', 'discover', 'diners'];

    return {
      detected,
      cardType: detected ? cardTypes[Math.floor(Math.random() * cardTypes.length)] : undefined,
    };
  }

  async readCard(): Promise<{ success: boolean; cardData?: any; error?: string }> {
    // Simulate card reading with Adyen-specific behavior
    await new Promise(resolve => setTimeout(resolve, 1200));

    const success = Math.random() > 0.08; // 92% success rate (better than Square)

    if (success) {
      return {
        success: true,
        cardData: {
          lastFour: Math.floor(Math.random() * 9000) + 1000,
          expiryMonth: Math.floor(Math.random() * 12) + 1,
          expiryYear: new Date().getFullYear() + Math.floor(Math.random() * 5),
          cardholderName: 'JANE SMITH',
          cardScheme: 'visa', // Additional Adyen-specific data
        },
      };
    } else {
      return {
        success: false,
        error: 'Chip/card communication error',
      };
    }
  }

  async promptPin(_amount: Money): Promise<{ success: boolean; pinEntered?: boolean; error?: string }> {
    // Simulate PIN entry with Adyen-specific behavior
    await new Promise(resolve => setTimeout(resolve, 2500)); // Longer PIN timeout

    const success = Math.random() > 0.12; // 88% success rate

    return {
      success,
      pinEntered: success,
      error: success ? undefined : 'Incorrect PIN or timeout',
    };
  }

  async completeTransaction(): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate transaction completion with Adyen-specific behavior
    await new Promise(resolve => setTimeout(resolve, 1800));

    const success = Math.random() > 0.03; // 97% success rate (better than Square)

    return {
      success,
      transactionId: success ? `adyen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined,
      error: success ? undefined : 'Transaction declined by issuer',
    };
  }

  async cancelTransaction(): Promise<boolean> {
    // Simulate transaction cancellation
    await new Promise(resolve => setTimeout(resolve, 300));
    return true; // Always successful
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      // Initialize terminal if needed
      const terminalReady = await this.initializeTerminal();
      if (!terminalReady) {
        return {
          success: false,
          error: 'Payment terminal not ready',
          amount: data.amount,
          method: data.method,
        };
      }

      // Simulate payment processing with Adyen Terminal
      await new Promise(resolve => setTimeout(resolve, 3000));

      const success = Math.random() > 0.05; // 95% success rate

      if (success) {
        return {
          success: true,
          transactionId: `adyen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: data.amount,
          method: data.method,
        };
      } else {
        return {
          success: false,
          error: 'Payment declined by card issuer',
          amount: data.amount,
          method: data.method,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Adyen payment failed',
        amount: data.amount,
        method: data.method,
      };
    }
  }

  async refundPayment(transactionId: string, amount?: Money): Promise<PaymentResult> {
    try {
      // Implement Adyen refund logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        transactionId: `refund_${transactionId}`,
        amount: amount || { amount: 0, currency: 'GBP' },
        method: { type: 'card', label: 'Card', icon: '💳' },
      };
    } catch {
      return {
        success: false,
        error: 'Refund failed',
        amount: amount || { amount: 0, currency: 'GBP' },
        method: { type: 'card', label: 'Card', icon: '💳' },
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    // Implement status check
    return {
      success: true,
      transactionId,
      amount: { amount: 0, currency: 'GBP' },
      method: { type: 'card', label: 'Card', icon: '💳' },
    };
  }
}

// Stripe implementation (most common)
export class StripePaymentService implements PaymentService {
  constructor(
    private apiKey: string,
    private publishableKey?: string
  ) {}

  getSupportedMethods(): PaymentMethod[] {
    return [
      { type: 'card', label: 'Credit/Debit Card', icon: '💳' },
      { type: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
      { type: 'google_pay', label: 'Google Pay', icon: '🎯' },
    ];
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      // In a real implementation, this would call Stripe's API
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        return {
          success: true,
          transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: data.amount,
          method: data.method,
        };
      } else {
        return {
          success: false,
          error: 'Payment declined by card issuer',
          amount: data.amount,
          method: data.method,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        amount: data.amount,
        method: data.method,
      };
    }
  }

  async refundPayment(transactionId: string, amount?: Money): Promise<PaymentResult> {
    // Implement refund logic
    return {
      success: false,
      error: 'Refund not implemented',
      amount: amount || { amount: 0, currency: 'GBP' },
      method: { type: 'card', label: 'Card', icon: '💳' },
    };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    // Implement status check
    return {
      success: true,
      transactionId,
      amount: { amount: 0, currency: 'GBP' },
      method: { type: 'card', label: 'Card', icon: '💳' },
    };
  }
}

// Cash payment implementation (for kiosks)
export class CashPaymentService implements PaymentService {
  getSupportedMethods(): PaymentMethod[] {
    return [{ type: 'cash', label: 'Cash Payment', icon: '💵' }];
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    // Cash payments are always successful (paid at counter)
    return {
      success: true,
      transactionId: `cash_${Date.now()}`,
      amount: data.amount,
      method: data.method,
    };
  }

  async refundPayment(transactionId: string, amount?: Money): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `refund_${transactionId}`,
      amount: amount || { amount: 0, currency: 'GBP' },
      method: { type: 'cash', label: 'Cash', icon: '💵' },
    };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      amount: { amount: 0, currency: 'GBP' },
      method: { type: 'cash', label: 'Cash', icon: '💵' },
    };
  }
}

// Mock payment service for development
export class MockPaymentService implements PaymentService {
  getSupportedMethods(): PaymentMethod[] {
    return [
      { type: 'card', label: 'Mock Card', icon: '🎭' },
      { type: 'cash', label: 'Mock Cash', icon: '🎪' },
    ];
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      transactionId: `mock_${Date.now()}`,
      amount: data.amount,
      method: data.method,
    };
  }

  async refundPayment(transactionId: string, amount?: Money): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `mock_refund_${transactionId}`,
      amount: amount || { amount: 0, currency: 'GBP' },
      method: { type: 'cash', label: 'Mock Cash', icon: '🎪' },
    };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      amount: { amount: 0, currency: 'GBP' },
      method: { type: 'card', label: 'Mock Card', icon: '🎭' },
    };
  }
}

// Payment service factory
export class PaymentServiceFactory {
  static createService(type: 'stripe' | 'square' | 'adyen' | 'cash' | 'mock', config?: Record<string, unknown>): PaymentService {
    switch (type) {
      case 'stripe':
        return new StripePaymentService(config?.apiKey as string, config?.publishableKey as string | undefined);
      case 'square':
        return new SquarePaymentService(config?.applicationId as string, config?.accessToken as string, config?.locationId as string);
      case 'adyen':
        return new AdyenPaymentService(
          config?.apiKey as string,
          config?.merchantAccount as string,
          config?.terminalId as string | undefined
        );
      case 'cash':
        return new CashPaymentService();
      case 'mock':
      default:
        return new MockPaymentService();
    }
  }
}
