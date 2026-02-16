import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TopNav from "@/components/vendor/TopNav/TopNav";
import { useLanguage } from "@/context/LanguageContext";
import { View, TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";
import { useRouter } from "expo-router";
import { useState } from "react";

/* ================= CUSTOM DRAWER CONTENT ================= */

const CustomDrawerContent = ({ navigation, state, descriptors }: any) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      const refreshToken = await AsyncStorage.getItem("refreshToken");

      // Call sign-out endpoint if refresh token exists
      if (refreshToken) {
        try {
          await api.post(endpoints.signOut, { 
            refresh: refreshToken 
          });
        } catch (apiError) {
          console.error("Sign out API error:", apiError);
          // Continue with local cleanup even if API fails
        }
      }

      // Clear all stored data
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "userData",
        "email",
        "userId",
        "userRole",
        "vendorData"
      ]);

      // Clear API headers
      delete api.defaults.headers.common["Authorization"];

      // Navigate to sign in
      router.replace("/signIn");

    } catch (error: any) {
      console.error("Sign out error:", error);
      
      // Even if everything fails, clear local data
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "userData",
        "email",
        "userId",
        "userRole",
        "vendorData"
      ]);

      delete api.defaults.headers.common["Authorization"];
      router.replace("/signIn");
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    navigation.closeDrawer();

    Alert.alert(
      t("confirm_sign_out") || "Sign Out",
      t("confirm_sign_out_message") || "Are you sure you want to sign out?",
      [
        { 
          text: t("cancel") || "Cancel", 
          style: "cancel" 
        },
        {
          text: t("sign_out") || "Sign Out",
          onPress: handleSignOut,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View className="flex-1 mt-20">
      {/* Drawer Items */}
      {state.routes
        // Hide profile screen and dynamic routes from drawer
        .filter((route: any) => 
          route.name !== "profile" && 
          route.name !== "[id]" // Hide the dynamic route
        )
        .map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.drawerLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              className={`flex-row items-center px-4 py-4 ${
                isFocused ? "bg-gray-100" : "bg-transparent"
              }`}
              disabled={isSigningOut}
            >
              {options.drawerIcon &&
                options.drawerIcon({
                  color: isFocused ? "#000" : "#555",
                  size: 24,
                  focused: isFocused,
                })}

              <Text
                className={`ml-4 text-base ${
                  isFocused
                    ? "text-black font-medium"
                    : "text-gray-600"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

      {/* Sign Out Section */}
      <View className="mt-auto mb-8 border-t border-gray-200 pt-4">
        <TouchableOpacity
          onPress={confirmSignOut}
          className="flex-row items-center px-4 py-4"
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <>
              <ActivityIndicator size="small" color="#ef4444" />
              <Text className="ml-4 text-red-500 text-base font-medium">
                {t("signing_out") || "Signing Out..."}
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={24}
                color="#ef4444"
                style={{ transform: [{ scaleX: -1 }] }}
              />
              <Text className="ml-4 text-red-500 text-base font-medium">
                {t("sign_out") || "Sign Out"}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text className="text-xs text-gray-400 text-center mt-2">
          Version 1.0.0
        </Text>
      </View>
    </View>
  );
};

/* ================= VENDOR DRAWER ================= */

export default function VendorLayout() {
  const { t } = useLanguage();

  // Helper function for translations with fallbacks
  const safeT = (key: string, fallback: string) => {
    const translation = t(key);
    return typeof translation === 'string' && translation ? translation : fallback;
  };

  return (
    <Drawer
      initialRouteName="dashboard"
      screenOptions={{
        header: (props: any) => <TopNav {...props} />,
        drawerActiveTintColor: "#000",
        drawerInactiveTintColor: "#555",
        drawerLabelStyle: { fontSize: 15, marginLeft: -10 },
        drawerStyle: {
          width: 280,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: safeT("dashboard", "Dashboard"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="products"
        options={{
          title: safeT("products", "Products"),
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
          title: safeT("orders", "Orders"),
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="bag-handle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="inventory"
        options={{
          title: safeT("inventory", "Inventory"),
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
        name="VendorStore"
        options={{
          title: safeT("vendor_store", "My Store"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="analytics"
        options={{
          title: safeT("analytics", "Analytics"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="earnings"
        options={{
          title: safeT("earnings", "Earnings"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="support"
        options={{
          title: safeT("support", "Support"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden from drawer but usable internally */}
      <Drawer.Screen
        name="profile"
        options={{
          title: safeT("store_profile", "Store Profile"),
          drawerItemStyle: { display: "none" },
        }}
      />

      {/* Add [id] as a hidden screen */}
      <Drawer.Screen
        name="[id]"
        options={{
          title: "Product Details", // This won't be shown anyway
          drawerItemStyle: { display: "none" }, // This hides it from the drawer
        }}
      />
    </Drawer>
  );
}