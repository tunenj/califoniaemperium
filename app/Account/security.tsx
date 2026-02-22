import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import Icon from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLanguage } from '@/context/LanguageContext'; // Add import

export default function SecurityScreen() {
  const { t } = useLanguage(); // Add hook
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
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

        <Text className="text-lg ml-2 font-bold">{t('security')}</Text>
      </View>

      {/* Content */}
      <View className="mt-4 px-5 gap-6">
        {/* Change Password */}
        <TouchableOpacity className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Icon name="lock-closed-outline" size={22} />
            <Text className="ml-3 text-base">{t('change_password')}</Text>
          </View>
          <Icon name="chevron-forward" size={20} />
        </TouchableOpacity>

        {/* Enable 2FA */}
        <TouchableOpacity className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Icon name="shield-checkmark-outline" size={22} />
            <Text className="ml-3 text-base">{t('enable_2fa')}</Text>
          </View>
          <Icon name="chevron-forward" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}