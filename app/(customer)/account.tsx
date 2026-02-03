import React, { useState } from "react";
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

  const router = useRouter();
  const { t } = useLanguage();

  // Sign Out Function
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
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
        t('signed_out_message') || 'You have been successfully signed out.'
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
        t('signed_out_message') || 'You have been successfully signed out.'
      );
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
        <Image
          source={require("../../assets/icons/profile-avatar.png")}
          className="w-20 h-20 border-2 rounded-full"
        />

        <Text className="text-lg font-semibold mt-2">Vivian Coker</Text>

        <TouchableOpacity className="mt-1">
          <Text className="text-red-500">{t('switch_to_business')} ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Menu List */}
      <View className="mt-6 px-5 gap-4">
        <MenuItem
          icon="person-outline"
          title={t('personal_information')}
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
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center">
              <Icon name="moon-outline" size={20} />
            </View>
            <Text className="ml-3 text-base">{t('dark_mode')}</Text>
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
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center">
              <Icon name="image-outline" size={20} />
            </View>
            <Text className="ml-3 text-base">{t('allow_screenshot')}</Text>
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
      <View className="items-center mt-10">
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={confirmSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color="red" />
          ) : (
            <>
              <Icon
                name="log-out-outline"
                size={22}
                color="red"
                style={{ transform: [{ scaleX: -1 }] }}
              />
              <Text className="text-red-600 text-base ml-2">
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
      className="flex-row justify-between items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center">
          <Icon name={icon} size={20} />
        </View>

        <Text className="ml-3 text-base">{title}</Text>
      </View>

      <Icon name="chevron-forward" size={20} />
    </TouchableOpacity>
  );
};