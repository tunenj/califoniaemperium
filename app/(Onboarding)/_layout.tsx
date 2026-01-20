import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SelectLanguage" />
      <Stack.Screen name="OnboardingSignUp" />
      <Stack.Screen name="OnboardingSignIn" />
    </Stack>
  );
}
