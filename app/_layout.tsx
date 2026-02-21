import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ExploreSearchProvider } from "@/context/ExploreSearchContext";
import { CategorySearchProvider } from "@/context/CategorySearchContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { BiometricProvider } from "@/context/BiometricContext"; // ✅ ADD THIS IMPORT
import "@/lib/i18n";
import "../global.css";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { SetupProvider } from "@/context/VendorApplicationContext";
import { WishlistProvider } from '@/context/WishlistContext';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, LogBox } from 'react-native';

// Never hide errors in development
if (__DEV__) {
  LogBox.ignoreAllLogs(false);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 p-5 bg-gray-900 justify-start">
          <Text className="text-red-500 text-xl font-bold mt-16 mb-2">
            ❌ Runtime Error
          </Text>

          <Text className="text-red-300 text-sm mb-4">
            {this.state.error?.name}: {this.state.error?.message}
          </Text>

          <ScrollView className="bg-gray-800 rounded-lg p-3 max-h-80 mb-5">
            <Text className="text-red-400 text-xs font-mono leading-5">
              {this.state.error?.stack}
            </Text>

            {this.state.errorInfo?.componentStack && (
              <>
                <Text className="text-gray-400 text-xs mt-3 mb-1">
                  Component Stack:
                </Text>
                <Text className="text-yellow-600 text-xs font-mono leading-5">
                  {this.state.errorInfo.componentStack}
                </Text>
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-red-700 py-3.5 rounded-lg items-center"
          >
            <Text className="text-white font-semibold text-base">
              Try Again
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-500 text-xs text-center mt-3">
            Check your terminal for the full error details
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// ─── Toast Config ─────────────────────────────────────────────────────────────
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
      text1Style={{ fontSize: 16, fontWeight: '600', color: '#2E7D32' }}
      text2Style={{ fontSize: 14, color: '#388E3C' }}
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
      text1Style={{ fontSize: 16, fontWeight: '600', color: '#C62828' }}
      text2Style={{ fontSize: 14, color: '#D32F2F' }}
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
      text1Style={{ fontSize: 16, fontWeight: '600', color: '#1565C0' }}
      text2Style={{ fontSize: 14, color: '#1976D2' }}
    />
  ),
};


export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <SetupProvider>
                  <ExploreSearchProvider>
                    <CategorySearchProvider>
                      <BiometricProvider> {/* ✅ ADD BIOMETRIC PROVIDER HERE */}
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
                      </BiometricProvider> {/* ✅ CLOSE BIOMETRIC PROVIDER */}
                    </CategorySearchProvider>
                  </ExploreSearchProvider>
                </SetupProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}