import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import type { KioskFlowParamList } from './types';
import SplashScreen from '../screens/Splash/SplashScreen';
import ProductsScreen from '../screens/Products/ProductsScreen';
import UpsellScreen from '../screens/Upsell/UpsellScreen';
import BasketScreen from '../screens/Basket/BasketScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import ConfirmationScreen from '../screens/Confirmation/ConfirmationScreen';
import IdleTimer from '../components/IdleTimer';

const Stack = createStackNavigator<KioskFlowParamList>();

const MainNavigator: React.FC = () => {
  return (
    <IdleTimer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName="Attract" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Attract" component={SplashScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="Upsell" component={UpsellScreen} />
          <Stack.Screen name="Basket" component={BasketScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
        </Stack.Navigator>
      </View>
    </IdleTimer>
  );
};

export default MainNavigator;
