import type { PaymentMethod } from '../services/interfaces';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Order: undefined;
  Scan: undefined;
  Search: undefined;
  More: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Settings: undefined;
  Reports: undefined;
  SyncQueue: undefined;
  Returns: undefined;
  Users: undefined;
  OrderHistory: undefined;
  KioskConfig: undefined;
};

// Kiosk customer-flow stack (used inside the Order tab)
export type KioskFlowParamList = {
  Attract: undefined;
  Upsell: {
    addedProductId: string;
    addedProductName: string;
    basketTotal: number;
    basketItemCount: number;
  };
  Products: {
    categoryId?: string;
    searchQuery?: string;
  };
  Basket: undefined;
  Checkout: undefined;
  Payment: {
    draftOrderId: string;
    customerName?: string;
    customerEmail?: string;
    selectedPaymentMethod?: PaymentMethod;
  };
  Confirmation: {
    orderId: string;
    paymentResult?: {
      method: PaymentMethod;
      amount: { amount: number; currency: string };
      currency: string;
      transactionId: string;
    };
    customerName?: string;
    customerEmail?: string;
  };
};
