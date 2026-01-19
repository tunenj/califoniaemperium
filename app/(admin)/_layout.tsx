import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function AdminLayout() {
  const router = useRouter();

  // DEMO route protection
  useEffect(() => {
    // Later replace with real auth check
    const isAdmin = true;

    if (!isAdmin) {
      router.replace("/(auth)/LoginForm/EmailSignIn");
    }
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#C62828" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/LoginForm/EmailSignIn")}
          >
            <Text className="text-white font-semibold mr-4">
              Logout
            </Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="home"
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name="users"
        options={{ title: "Manage Users" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "Admin Settings" }}
      />
    </Stack>
  );
}
