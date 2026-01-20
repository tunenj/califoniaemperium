// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "../global.css";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Onboarding */}
            <Stack.Screen name="(Onboarding)" />
            {/* Customer */}
            <Stack.Screen name="(customer)" />

            {/* Vendor */}
            <Stack.Screen name="(vendor)" />

            {/* Admin */}
            <Stack.Screen name="(admin)" />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
