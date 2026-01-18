// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(Onboarding)" />
          <Stack.Screen name="(customer)" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
