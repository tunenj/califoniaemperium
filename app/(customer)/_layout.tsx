import { Tabs } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext';

export default function CustomerLayout() {
  const { t } = useLanguage();

  // Screens that should be hidden from tab bar
  const hiddenScreens = [
    'store',
    'store/index',
    'store/[slug]',
    'store-reviews',
    'profile-setup',
    'product/[slug]',
  ];

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
          title: t('home'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="category"
        options={{
          title: t('category'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: t('explore'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t('account'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          )
        }}
      />

      {/* Hidden screens - NOT in tab bar */}
      {hiddenScreens.map((screenName) => (
        <Tabs.Screen
          key={screenName}
          name={screenName as any}
          options={{
            href: null,
          }}
        />
      ))}
    </Tabs>
  );
}