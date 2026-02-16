import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { View, TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";

/* ================= CUSTOM ADMIN DRAWER CONTENT WITH LOGOUT ================= */

const CustomAdminDrawerContent = ({ navigation, state, descriptors }: any) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      navigation.closeDrawer();

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
        "adminData"
      ]);

      // Clear API headers
      delete api.defaults.headers.common["Authorization"];

      // Navigate to sign in
      router.replace("/LoginForm/EmailSignIn");

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
        "adminData"
      ]);

      delete api.defaults.headers.common["Authorization"];
      router.replace("/LoginForm/EmailSignIn");
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
      {/* Admin Header */}
      <View className="px-4 py-6 border-b border-gray-200 mb-4">
        <Text className="text-xl font-bold text-gray-800">Admin Panel</Text>
        <Text className="text-sm text-gray-500 mt-1">Manage your marketplace</Text>
      </View>

      {/* Drawer Items */}
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.drawerLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        // Don't show hidden items
        if (options.drawerItemStyle?.display === "none") return null;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className={`flex-row items-center px-4 py-4 mx-2 rounded-lg ${isFocused ? "bg-red-50" : "bg-transparent"
              }`}
            disabled={isSigningOut}
          >
            {options.drawerIcon &&
              options.drawerIcon({
                color: isFocused ? "#B13239" : "#555",
                size: 24,
                focused: isFocused,
              })}

            <Text
              className={`ml-4 text-base ${isFocused
                  ? "text-red-600 font-medium"
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
          className="flex-row items-center px-4 py-4 mx-2 rounded-lg"
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

        <Text className="text-xs text-gray-400 text-center mt-4">
          Admin Version 2.0.0
        </Text>
      </View>
    </View>
  );
};

/* ================= ADMIN LAYOUT ================= */

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
        drawerActiveTintColor: "#B13239",
        drawerInactiveTintColor: "#555",
        drawerLabelStyle: { fontSize: 15, marginLeft: -10 },
        drawerStyle: {
          width: 280,
        },
      }}
      drawerContent={(props) => <CustomAdminDrawerContent {...props} />}
    >
      {/* Dashboard */}
      <Drawer.Screen
        name="home"
        options={{
          title: safeT("Dashboard", "Dashboard"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
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
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bag-handle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Support */}
      {/* <Drawer.Screen
        name="support"
        options={{
          title: safeT("support", "Support"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" size={size} color={color} />
          ),
        }}
      /> */}

      {/* Vendors */}
      <Drawer.Screen
        name="vendors"
        options={{
          title: safeT("vendors", "Vendors"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
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
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="percent-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Payouts */}
      <Drawer.Screen
        name="payouts"
        options={{
          title: safeT("payouts", "Payouts"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Analytics */}
      <Drawer.Screen
        name="analytics"
        options={{
          title: safeT("analytics", "Analytics"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Settings - Hidden from drawer but accessible via deep link */}
      <Drawer.Screen
        name="settings"
        options={{
          title: safeT("settings", "Settings"),
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