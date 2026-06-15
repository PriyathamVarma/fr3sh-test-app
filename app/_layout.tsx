import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '@/context/CartContext';
import { UserProvider } from '@/context/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product-listing" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="product-detail" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="farmer-profile" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="farmer-list" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="fpo-list" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="fpo-detail" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="harvest-list" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="harvest-detail" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="order-history" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="order-detail" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="checkout" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="wallet" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="referral" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="badges" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="frsh-plus" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="community" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="prebookings" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="addresses" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="farmer-dashboard" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="delivery-dashboard" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </CartProvider>
    </UserProvider>
  );
}
