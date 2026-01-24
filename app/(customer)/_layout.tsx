import { Tabs } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext'; // Add import

export default function CustomerLayout() {
  const { t } = useLanguage(); // Add hook

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
          title: t('home'), // Use translation
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="category"
        options={{
          title: t('category'), // Use translation
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: t('explore'), // Use translation
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart'), // Use translation
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t('account'), // Use translation
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