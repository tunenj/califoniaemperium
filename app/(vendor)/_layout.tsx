import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TopNav from "@/components/vendor/TopNav/TopNav";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { useLanguage } from '@/context/LanguageContext';
import { View, TouchableOpacity, Text, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { useRouter } from 'expo-router';

// Custom drawer content component for sign-out
const CustomDrawerContent = (props: any) => {
  const { t } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Close drawer first
      props.navigation.closeDrawer();
      
      // Get the refresh token
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Call sign-out endpoint
        await api.post(endpoints.signOut, {
          refresh: refreshToken
        });
      }
      
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'email',
        'userId'
      ]);
      
      // Clear API headers
      delete api.defaults.headers.common['Authorization'];
      
      // Navigate to login screen
      router.replace('/signIn');
      
      Alert.alert(
        t('signed_out') || 'Signed Out',
        t('signed_out_message') || 'You have been signed out successfully.'
      );
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      // Even if API call fails, clear local data
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'email',
        'userId'
      ]);
      delete api.defaults.headers.common['Authorization'];
      
      router.replace('/signIn');
      
      Alert.alert(
        t('signed_out') || 'Signed Out',
        t('sign_out_message') || 'You have been signed out successfully.'
      );
    }
  };

  const confirmSignOut = () => {
    props.navigation.closeDrawer();
    
    Alert.alert(
      t('confirm_sign_out') || 'Sign Out',
      t('confirm_sign_out_message') || 'Are you sure you want to sign out?',
      [
        {
          text: t('cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('sign_out') || 'Sign Out',
          onPress: handleSignOut,
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View className="flex-1 mt-20">
      {/* Drawer items */}
      {props.state.routes.map((route: any, index: number) => {
        const { options } = props.descriptors[route.key];
        const label = options.drawerLabel ?? options.title ?? route.name;
        const isFocused = props.state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              props.navigation.navigate(route.name);
            }}
            className={`
              flex-row items-center px-4 py-4
              ${isFocused ? 'bg-gray-100' : 'bg-transparent'}
            `}
          >
            {options.drawerIcon && options.drawerIcon({
              color: isFocused ? '#000' : '#555',
              size: 24,
              focused: isFocused
            })}
            <Text className={`
              ml-4 text-base
              ${isFocused ? 'text-black font-medium' : 'text-gray-600'}
            `}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
      
      {/* Sign Out Button at bottom */}
      <View className="mt-36 border-t border-gray-200">
        <TouchableOpacity
          onPress={confirmSignOut}
          className="flex-row items-center px-4 py-4"
        >
          <Ionicons 
            name="log-out-outline" 
            size={24} 
            color="#ef4444" 
            style={{ transform: [{ scaleX: -1 }] }}
          />
          <Text className="ml-4 text-red-500 text-base font-medium">
            {t('sign_out') || 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function VendorLayout() {
  const { t } = useLanguage();

  return (
    <Drawer
      initialRouteName="dashboard"
      screenOptions={{
        header: (props: DrawerHeaderProps) => <TopNav {...props} />,
        drawerActiveTintColor: "#000",
        drawerInactiveTintColor: "#555",
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: t('dashboard'),
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
        name="inventory"
        options={{
          title: t('inventory'),
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
          title: t('messages'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: t('store_profile'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}