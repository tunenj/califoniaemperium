// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ExploreSearchProvider } from "@/context/ExploreSearchContext";
import { CategorySearchProvider } from "@/context/CategorySearchContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { BiometricProvider } from "@/context/BiometricContext";
import { SetupProvider } from "@/context/VendorApplicationContext";
import { WishlistProvider } from '@/context/WishlistContext';
import "@/lib/i18n";
import "../global.css";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import React, { Suspense } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LogBox, SafeAreaView, Platform, ActivityIndicator } from 'react-native';

// Never hide errors in development
if (__DEV__) {
  LogBox.ignoreAllLogs(false);
  // You can ignore specific logs if needed
  // LogBox.ignoreLogs(['Some specific warning']);
}

// ─── Loading Fallback Component ─────────────────────────────────────────
const LoadingFallback = () => (
  <View className="flex-1 justify-center items-center bg-white">
    <ActivityIndicator size="large" color="#0000ff" />
    <Text className="text-gray-600 text-lg mt-4">Loading...</Text>
  </View>
);

// ─── Error Boundary Component ─────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('📋 Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-gray-900">
          <View className="flex-1 p-5 justify-start">
            <Text className="text-red-500 text-2xl font-bold mt-10 mb-2">
              ⚠️ Something went wrong
            </Text>

            <Text className="text-red-300 text-base mb-4">
              {this.state.error?.name}: {this.state.error?.message}
            </Text>

            <ScrollView 
              className="bg-gray-800 rounded-lg p-4 max-h-96 mb-5"
              showsVerticalScrollIndicator={true}
            >
              <Text className="text-red-400 text-xs font-mono leading-5">
                {this.state.error?.stack}
              </Text>

              {this.state.errorInfo?.componentStack && (
                <>
                  <Text className="text-gray-400 text-sm mt-4 mb-2 font-bold">
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
              className="bg-red-600 py-4 rounded-xl items-center active:bg-red-700"
            >
              <Text className="text-white font-semibold text-lg">
                Try Again
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-xs text-center mt-4">
              Check your terminal for the full error details
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// ─── Toast Configuration ─────────────────────────────────────────────────
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#10B981',
        backgroundColor: '#ECFDF5',
        marginTop: Platform.OS === 'ios' ? 50 : 10,
        marginHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#065F46',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      }}
      text2Style={{ 
        fontSize: 14, 
        color: '#047857',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#EF4444',
        backgroundColor: '#FEF2F2',
        marginTop: Platform.OS === 'ios' ? 50 : 10,
        marginHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#991B1B',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      }}
      text2Style={{ 
        fontSize: 14, 
        color: '#B91C1C',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
        marginTop: Platform.OS === 'ios' ? 50 : 10,
        marginHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1E3A8A',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      }}
      text2Style={{ 
        fontSize: 14, 
        color: '#1E40AF',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      }}
    />
  ),
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#F59E0B',
        backgroundColor: '#FFFBEB',
        marginTop: Platform.OS === 'ios' ? 50 : 10,
        marginHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#92400E',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      }}
      text2Style={{ 
        fontSize: 14, 
        color: '#B45309',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      }}
    />
  ),
};

// Main Root Layout Component 
export default function RootLayout() {
  console.log('RootLayout rendering...');

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <SetupProvider>
                    <ExploreSearchProvider>
                      <CategorySearchProvider>
                        <BiometricProvider>
                          {/* Main Navigation Stack */}
                          <Stack 
                            screenOptions={{ 
                              headerShown: false,
                              animation: 'slide_from_right',
                              gestureEnabled: true,
                              gestureDirection: 'horizontal',
                            }}
                          >
                            {/* Onboarding Stack */}
                            <Stack.Screen 
                              name="(Onboarding)" 
                              options={{ 
                                animation: 'fade',
                              }} 
                            />
                            
                            {/* Customer Stack */}
                            <Stack.Screen 
                              name="(customer)" 
                              options={{ 
                                animation: 'slide_from_right',
                              }} 
                            />
                            
                            {/* Vendor Stack */}
                            <Stack.Screen 
                              name="(vendor)" 
                              options={{ 
                                animation: 'slide_from_bottom',
                              }} 
                            />
                            
                            {/* Admin Stack */}
                            <Stack.Screen 
                              name="(admin)" 
                              options={{ 
                                animation: 'slide_from_bottom',
                              }} 
                            />
                            
                            {/* Auth Screens */}
                            <Stack.Screen 
                              name="auth/login" 
                              options={{ 
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                              }} 
                            />
                            <Stack.Screen 
                              name="auth/register" 
                              options={{ 
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                              }} 
                            />
                            <Stack.Screen 
                              name="auth/forgot-password" 
                              options={{ 
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                              }} 
                            />
                            
                            {/* Catch-all route for 404 */}
                            <Stack.Screen 
                              name="+not-found" 
                              options={{ 
                                title: 'Not Found',
                                presentation: 'modal',
                              }} 
                            />
                          </Stack>

                          {/* Toast Notifications */}
                          <Toast 
                            config={toastConfig}
                            topOffset={Platform.OS === 'ios' ? 50 : 20}
                            visibilityTime={4000}
                            position="top"
                          />
                        </BiometricProvider>
                      </CategorySearchProvider>
                    </ExploreSearchProvider>
                  </SetupProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  );
}