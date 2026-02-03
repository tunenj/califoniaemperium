import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const isAdmin = true;

    if (!isAdmin) {
      router.replace("/LoginForm/EmailSignIn");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <Drawer
      screenOptions={{
        headerShown: true, // ✅ TopNav removed, drawer still works
        drawerActiveTintColor: "#000",
        drawerInactiveTintColor: "#555",
        drawerLabelStyle: { fontSize: 15 },
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: t('Dashboard'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="products"
        options={{
          title: t('products'),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cube-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="orders"
        options={{
          title: t('orders'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bag-handle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="support"
        options={{
          title: t('support'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="vendors"
        options={{
          title: t('vendors'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="dropShipping"
        options={{
          title: t('drop_shipping'),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="commission"
        options={{
          title: t('commission'),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="percent-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="payouts"
        options={{
          title: t('payouts'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="analytics"
        options={{
          title: t('analytics'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
