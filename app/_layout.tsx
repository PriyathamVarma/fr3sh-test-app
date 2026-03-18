import { Stack } from 'expo-router';
import { CartProvider } from '@/context/CartContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product-listing" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="product-detail" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </CartProvider>
  );
}
