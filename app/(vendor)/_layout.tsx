import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TopNav from "@/components/vendor/TopNav/TopNav";
import { DrawerHeaderProps } from "@react-navigation/drawer";

export default function VendorLayout() {
  return (
    <Drawer
      initialRouteName="dashboard"
      screenOptions={{
        header: (props: DrawerHeaderProps) => <TopNav {...props} />,
        drawerActiveTintColor: "#000",
        drawerInactiveTintColor: "#555",
      }}
    >
      <Drawer.Screen
        name="dashboard"
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
        name="inventory"
        options={{
          title: "Inventory",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="messages"
        options={{
          title: "Messages",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: "Store Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

