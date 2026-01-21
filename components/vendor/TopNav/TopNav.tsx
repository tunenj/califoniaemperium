import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  navigation: any;
};

const TopNav: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="bg-white pt-4">
      <View className="flex-row items-center justify-between px-4 h-8">

        {/* Menu button */}
        <TouchableOpacity
          onPress={() => navigation?.toggleDrawer?.()}
          className="p-1"
        >
          <Ionicons name="menu" size={24} color="#1F2937" />
        </TouchableOpacity>

        {/* Spacer (keeps icons aligned) */}
        <View />

        {/* Right icons */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => console.log("Settings")}>
            <Ionicons name="settings-outline" size={22} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log("Notifications")}>
            <Ionicons name="notifications-outline" size={22} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log("Profile")}>
            <Ionicons name="person-outline" size={20} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopNav;
