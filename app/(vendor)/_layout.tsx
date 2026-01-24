import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TopNav from "@/components/vendor/TopNav/TopNav";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { useLanguage } from '@/context/LanguageContext'; // Add import

export default function VendorLayout() {
  const { t } = useLanguage(); // Add hook

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
          title: t('dashboard'), // Use translation
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="products"
        options={{
          title: t('products'), // Use translation
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
          title: t('orders'), // Use translation
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bag-handle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="inventory"
        options={{
          title: t('inventory'), // Use translation
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
          title: t('messages'), // Use translation
          drawerIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: t('store_profile'), // Use translation
          drawerIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}