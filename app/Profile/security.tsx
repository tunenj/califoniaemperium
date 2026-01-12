import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Switch } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function SecurityScreen() {
  const [biometrics, setBiometrics] = useState(false);
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

        <Text className="text-lg ml-2 font-semibold">Security</Text>
      </View>

      {/* Content */}
      <View className="mt-4 px-5 gap-6">
        {/* Biometrics Row */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Icon name="finger-print-outline" size={22} />
            <Text className="ml-3 text-base">Biometrics</Text>
          </View>

          <Switch
            value={biometrics}
            onValueChange={setBiometrics}
            trackColor={{ false: "#D1D5DB", true: "#B13239" }}
            thumbColor={biometrics ? "#000" : "#f4f3f4"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        {/* Change Password */}
        <TouchableOpacity className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Icon name="lock-closed-outline" size={22} />
            <Text className="ml-3 text-base">Change password</Text>
          </View>
          <Icon name="chevron-forward" size={20} />
        </TouchableOpacity>

        {/* Enable 2FA */}
        <TouchableOpacity className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Icon name="shield-checkmark-outline" size={22} />
            <Text className="ml-3 text-base">Enable 2FA</Text>
          </View>
          <Icon name="chevron-forward" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
