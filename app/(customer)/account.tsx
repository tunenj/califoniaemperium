import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLanguage } from '@/context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

/* ================= PROFILE SCREEN ================= */

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [allowScreenshot, setAllowScreenshot] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userName, setUserName] = useState("");

  const router = useRouter();
  const { t } = useLanguage();

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const email = await AsyncStorage.getItem('email');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Try to get name from userData first
        setUserName(parsedUser.name || parsedUser.email || email || 'User');
      } else if (email) {
        // If no userData, use email (extract name part if possible)
        const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
        const formattedName = nameFromEmail
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setUserName(formattedName);
      } else {
        setUserName('User');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserName('User');
    }
  };

  // Sign Out Function
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Get the refresh token
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      // Call sign-out endpoint if refresh token exists
      if (refreshToken) {
        try {
          await api.post(endpoints.signOut, {
            refresh: refreshToken
          });
        } catch (apiError) {
          console.error('Sign out API error:', apiError);
          // Continue with local cleanup even if API fails
        }
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
      router.replace('/(auth)/LoginForm/EmailSignIn');
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      // Even if everything fails, clear local data
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'email',
        'userId'
      ]);
      delete api.defaults.headers.common['Authorization'];
      
      router.replace('/signIn');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Confirm Sign Out
  const confirmSignOut = () => {
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Gradient strip */}
      <LinearGradient
        colors={["#B13239", "#4D0812"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 44, width: "100%" }}
      />

      {/* Header */}
      <View className="h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text className="text-lg ml-2 font-semibold">{t('profile')}</Text>
      </View>

      {/* Profile Avatar */}
      <View className="items-center mt-2">
        <View className="relative">
          <Image
            source={require("../../assets/icons/profile-avatar.png")}
            className="w-20 h-20 border-2 border-white rounded-full"
          />
          <View className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
        </View>

        <Text className="text-xl font-bold mt-3">{userName}</Text>

        <TouchableOpacity className="mt-1 flex-row items-center">
          <Text className="text-red-500 text-sm">{t('switch_to_business')}</Text>
          <Icon name="chevron-down" size={16} color="#B13239" className="ml-1" />
        </TouchableOpacity>
      </View>

      {/* Menu List */}
      <View className="mt-8 px-5 gap-4">
        <MenuItem
          icon="person-outline"
          title={t('personal_information')}
          onPress={() => router.push("/Setup/profile-setup")}
        />

        <MenuItem
          icon="cube-outline"
          title={t('my_orders')}
          onPress={() => router.push("/Account/myOrder")}
        />

        <MenuItem
          icon="lock-closed-outline"
          title={t('security')}
          onPress={() => router.push("/Account/security")}
        />

        <MenuItem
          icon="headset-outline"
          title={t('support')}
          onPress={() => router.push("/Account/support")}
        />

        {/* Dark Mode Toggle */}
        <View className="flex-row justify-between items-center py-2">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Icon name="moon-outline" size={22} color="#4B5563" />
            </View>
            <Text className="ml-3 text-base text-gray-700">{t('dark_mode')}</Text>
          </View>

          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#D1D5DB", true: "#B13239" }}
            thumbColor={darkMode ? "#ffffff" : "#f4f3f4"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        {/* Screenshot Toggle */}
        <View className="flex-row justify-between items-center py-2">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Icon name="image-outline" size={22} color="#4B5563" />
            </View>
            <Text className="ml-3 text-base text-gray-700">{t('allow_screenshot')}</Text>
          </View>

          <Switch
            value={allowScreenshot}
            onValueChange={setAllowScreenshot}
            trackColor={{ false: "#D1D5DB", true: "#B13239" }}
            thumbColor={allowScreenshot ? "#ffffff" : "#f4f3f4"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>
      </View>

      {/* Sign Out */}
      <View className="items-center mt-auto mb-8">
        <TouchableOpacity 
          className="flex-row items-center bg-red-50 px-6 py-3 rounded-full"
          onPress={confirmSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <>
              <ActivityIndicator size="small" color="#B13239" />
              <Text className="text-red-600 text-base ml-2">
                {t('signing_out') || 'Signing Out...'}
              </Text>
            </>
          ) : (
            <>
              <Icon
                name="log-out-outline"
                size={22}
                color="#B13239"
                style={{ transform: [{ scaleX: -1 }] }}
              />
              <Text className="text-red-600 text-base ml-2 font-medium">
                {t('sign_out')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= MENU ITEM ================= */

type MenuItemProps = {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  onPress?: () => void;
};

const MenuItem = ({ icon, title, onPress }: MenuItemProps) => {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center py-2"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Icon name={icon} size={22} color="#4B5563" />
        </View>

        <Text className="ml-3 text-base text-gray-700">{title}</Text>
      </View>

      <Icon name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
};