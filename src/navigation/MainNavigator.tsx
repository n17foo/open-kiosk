import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import SplashScreen from '../screens/Splash/SplashScreen';
import PlatformSetupScreen from '../screens/PlatformSetup/PlatformSetupScreen';
import ProductsScreen from '../screens/Products/ProductsScreen';
import SignInScreen from '../screens/SignIn/SignInScreen';
import BasketScreen from '../screens/Basket/BasketScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import ConfirmationScreen from '../screens/Confirmation/ConfirmationScreen';

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PlatformSetup" component={PlatformSetupScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Basket" component={BasketScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
