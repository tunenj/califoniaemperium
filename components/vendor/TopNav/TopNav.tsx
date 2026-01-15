import React from "react";
import { View, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, DrawerActions } from "@react-navigation/native";

const TopNav: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="bg-white max-h-24">
      <View className="flex-row items-center justify-between px-4 shadow-sm">

        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          className="p-1"
        >
          <Ionicons
            name="menu"
            size={24}
            color="#1F2937"
            className="bg-gray-200 p-1.5 rounded-full mx-1"
          />
        </TouchableOpacity>

        {/* Right Icons */}
        <View className="flex-row items-center space-x-4 shadow-md shadow-gray-300 p-2 rounded-full">
          <TouchableOpacity className="p-1">
            <Ionicons name="settings-outline" size={22} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity className="p-1">
            <Ionicons name="notifications-outline" size={22} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={18} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopNav;
