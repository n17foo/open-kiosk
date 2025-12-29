export type RootStackParamList = {
  Splash: undefined;
  PlatformSetup: undefined;
  Products: {
    categoryId?: string;
    searchQuery?: string;
  };
  Basket: undefined;
  Checkout: {
    draftOrderId?: string;
  };
  SignIn: undefined;
  Payment: {
    draftOrderId: string;
    customerName?: string;
    customerEmail?: string;
    selectedPaymentMethod?: any; // PaymentMethod type
  };
  Confirmation: {
    orderId: string;
    paymentResult?: any;
    customerName?: string;
    customerEmail?: string;
  };
};
