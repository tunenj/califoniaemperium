// app/_layout.tsx - Complete Root Layout
import { SplashScreen, Stack, useRouter, } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Adjust path as needed
import "../global.css"

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      if (isAuthenticated) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(Onboarding)/OnboardingSignUp');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(Onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
