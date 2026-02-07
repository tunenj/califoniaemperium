import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const isAdmin = true; // replace with your real auth check

    if (!isAdmin) {
      router.replace("/LoginForm/EmailSignIn");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  // Helper function to safely get translations with fallbacks
  const safeT = (key: string, fallback: string) => {
    const translation = t(key);
    return typeof translation === 'string' ? translation : fallback;
  };

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: "#000",
        drawerInactiveTintColor: "#555",
        drawerLabelStyle: { fontSize: 15 },
      }}
    >
      {/* Dashboard */}
      <Drawer.Screen
        name="home"
        options={{
          title: safeT("Dashboard", "Dashboard"),
          drawerIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />

      {/* Products */}
      <Drawer.Screen
        name="products"
        options={{
          title: safeT("products", "Products"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cube-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Orders */}
      <Drawer.Screen
        name="orders"
        options={{
          title: safeT("orders", "Orders"),
          drawerIcon: ({ color, size }) => <Ionicons name="bag-handle-outline" size={size} color={color} />,
        }}
      />

      {/* Support */}
      <Drawer.Screen
        name="support"
        options={{
          title: safeT("support", "Support"),
          drawerIcon: ({ color, size }) => <Ionicons name="headset-outline" size={size} color={color} />,
        }}
      />

      {/* Vendors */}
      <Drawer.Screen
        name="vendors"
        options={{
          title: safeT("vendors", "Vendors"),
          drawerIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} />,
        }}
      />

      {/* Drop Shipping */}
      <Drawer.Screen
        name="dropShipping"
        options={{
          title: safeT("drop_shipping", "Drop Shipping"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="truck-delivery-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Commission */}
      <Drawer.Screen
        name="commission"
        options={{
          title: safeT("commission", "Commission"),
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="percent-outline" size={size} color={color} />,
        }}
      />

      {/* Payouts */}
      <Drawer.Screen
        name="payouts"
        options={{
          title: safeT("payouts", "Payouts"),
          drawerIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} />,
        }}
      />

      {/* Analytics */}
      <Drawer.Screen
        name="analytics"
        options={{
          title: safeT("analytics", "Analytics"),
          drawerIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}