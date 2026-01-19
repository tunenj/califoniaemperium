import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SelectLanguage"
        options={{
          headerShown: false,
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="OnboardingSignUp"
        options={{
          headerShown: false,
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="OnboardingSignIn"
        options={{
          headerShown: false,
          headerLeft: () => null,
        }}
      />
    </Stack>
  );
}
