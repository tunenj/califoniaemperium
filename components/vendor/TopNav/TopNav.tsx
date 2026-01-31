import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext"; // Add this import

type Props = {
  navigation: any;
};

const TopNav: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage(); // Add this hook

  return (
    <SafeAreaView className="bg-white pt-4">
      <View className="flex-row items-center justify-between px-4 h-8">

        {/* Menu button */}
        <TouchableOpacity
          onPress={() => navigation?.toggleDrawer?.()}
          className="p-1"
          accessibilityLabel={t("menu") || "Menu"} // Optional: for screen readers
          accessibilityHint={t("open_navigation_drawer") || "Opens the navigation drawer"} // Optional: for screen readers
        >
          <Ionicons name="menu" size={28} color="#1F2937" />
        </TouchableOpacity>

        {/* Spacer (keeps icons aligned) */}
        <View />

        {/* Right icons */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            onPress={() => console.log("Settings")}
            accessibilityLabel={t("settings") || "Settings"} // Optional: for screen readers
          >
            <Ionicons name="settings-outline" size={22} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => console.log("Notifications")}
            accessibilityLabel={t("notifications") || "Notifications"} // Optional: for screen readers
          >
            <Ionicons name="notifications-outline" size={22} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => console.log("Profile")}
            accessibilityLabel={t("profile") || "Profile"} // Optional: for screen readers
          >
            <Ionicons name="person-outline" size={20} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopNav;