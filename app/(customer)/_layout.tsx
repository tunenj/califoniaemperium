import { Tabs } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#d13138",
        tabBarInactiveTintColor: "#9e9e9e"
      }}
    >
      {/* Regular tab screens */}
      <Tabs.Screen
        name="main"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="category"
        options={{
          title: "Category",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          )
        }}
      />

      {/* Store - shows tabs but NOT in tab bar */}
      <Tabs.Screen
        name="store"
        options={{
          href: null, // This hides it from tab bar
        }}
      />
      <Tabs.Screen
        name="store-reviews"
        options={{
          href: null, // This hides it from tab bar
        }}
      />
      <Tabs.Screen
        name="profile-setup"
        options={{
          href: null, // This hides it from tab bar
        }}
      />
    </Tabs>
  );
}