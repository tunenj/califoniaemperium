import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import TopNav from "@/components/vendor/TopNav/TopNav";

export default function AdminLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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
        headerShown: true, 
        header: (props) => <TopNav {...props} />,
        drawerActiveTintColor: "#000",
        drawerInactiveTintColor: "#555",
        drawerLabelStyle: { fontSize: 15 },
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="products"
        options={{
          title: "Products",
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
          title: "Orders",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bag-handle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="support"
        options={{
          title: "Support",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="vendors"
        options={{
          title: "Vendors",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="dropShipping"
        options={{
          title: "Drop Shipping",
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
          title: "Commission",
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
          title: "Payouts",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="analytics"
        options={{
          title: "Analytics",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
