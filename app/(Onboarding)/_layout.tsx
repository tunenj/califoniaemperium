import { Stack } from "expo-router";
import { View, Platform } from "react-native";

export default function OnboardingLayout() {
  const isWeb = Platform.OS === "web";

  return (
    <View
      style={
        isWeb
          ? {
              flex: 1,
              width: "100%",
              alignItems: "center",
              backgroundColor: "#f9fafb",
            }
          : { flex: 1 }
      }
    >
      <View
        style={
          isWeb
            ? {
                flex: 1,
                width: "100%",
                maxWidth: 600, // smaller width for auth screens
              }
            : { flex: 1 }
        }
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SelectLanguage" />
          <Stack.Screen name="OnboardingSignUp" />
          <Stack.Screen name="OnboardingSignIn" />
        </Stack>
      </View>
    </View>
  );
}