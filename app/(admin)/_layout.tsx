import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import TopNav from "@/components/vendor/TopNav/TopNav";
import { DrawerHeaderProps } from "@react-navigation/drawer";

export default function AdminLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // SAFE demo route protection
  useEffect(() => {
    const isAdmin = true; // replace later with real auth

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
        header: (props: DrawerHeaderProps) => <TopNav {...props} />,
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
        name="profile"
        options={{
          title: "Admin Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
