import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  navigation: any;
  route?: any;
  options?: {
    title?: string;
  };
};

const TopNav: React.FC<Props> = ({
  navigation,
  route,
  options,
}) => {
  return (
    <SafeAreaView className="bg-white">
      <View className="flex-row items-center justify-between px-4 h-14">

        <TouchableOpacity
          onPress={() => navigation?.toggleDrawer?.()}
          className="p-1"
        >
          <Ionicons name="menu" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-800">
          {options?.title ?? route?.name ?? ""}
        </Text>

        <View className="flex-row items-center space-x-4 gap-2">
          <Ionicons name="settings-outline" size={22} color="#1F2937" />
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
          <Ionicons name="person-outline" size={20} color="#1F2937" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopNav;
