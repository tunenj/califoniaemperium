import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ExploreSearchProvider } from "@/context/ExploreSearchContext";
import { CategorySearchProvider } from "@/context/CategorySearchContext";
import "@/lib/i18n";
import "../global.css";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { SetupProvider } from "@/context/VendorApplicationContext";
import { WishlistProvider } from '@/context/WishlistContext';


const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#4CAF50', 
        backgroundColor: '#E8F5E9',
        marginTop: 10,
        marginHorizontal: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32'
      }}
      text2Style={{
        fontSize: 14,
        color: '#388E3C'
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#F44336', 
        backgroundColor: '#FFEBEE',
        marginTop: 10,
        marginHorizontal: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#C62828'
      }}
      text2Style={{
        fontSize: 14,
        color: '#D32F2F'
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#2196F3', 
        backgroundColor: '#E3F2FD',
        marginTop: 10,
        marginHorizontal: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#1565C0'
      }}
      text2Style={{
        fontSize: 14,
        color: '#1976D2'
      }}
    />
  ),
};

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SetupProvider>
              <ExploreSearchProvider>
                <CategorySearchProvider>
                  {/* REMOVE the View wrapper - Toast might be conflicting with it */}
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(Onboarding)" />
                    <Stack.Screen name="(customer)" />
                    <Stack.Screen name="(vendor)" />
                    <Stack.Screen name="(admin)" />
                  </Stack>
                  <Toast 
                    config={toastConfig}
                    topOffset={50}
                  />
                </CategorySearchProvider>
              </ExploreSearchProvider>
            </SetupProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}