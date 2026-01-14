import { Drawer } from "expo-router/drawer";
import TopNav from "@/components/vendor/TopNav/TopNav";

export default function VendorLayout() {
  return (
    <Drawer
      screenOptions={{
        header: () => <TopNav />, // 👈 TopNav lives INSIDE drawer
      }}
    >
      <Drawer.Screen name="home" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="products" options={{ title: "Products" }} />
      <Drawer.Screen name="orders" options={{ title: "Orders" }} />
      <Drawer.Screen name="inventory" options={{ title: "Inventory" }} />
      <Drawer.Screen name="messages" options={{ title: "Messages" }} />
      <Drawer.Screen name="profile" options={{ title: "Store Profile" }} />
    </Drawer>
  );
}
