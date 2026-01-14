import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [allowScreenshot, setAllowScreenshot] = useState(true);

  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Gradient strip */}
      <LinearGradient
        colors={["#B13239", "#4D0812"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 44, width: "100%" }}
      />

      {/* Header BELOW gradient */}
      <View className="h-14 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text className="text-lg ml-2 font-semibold">Profile</Text>
      </View>

      {/* Profile Avatar */}
      <View className="items-center mt-2">
        <Image
          source={require("../../assets/icons/profile-avatar.png")}
          className="w-20 h-20 border-2 rounded-full"
        />

        <Text className="text-lg font-semibold mt-2">Vivian Coker</Text>

        <TouchableOpacity className="mt-1">
          <Text className="text-red-500">switch to business ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Menu List */}
      <View className="mt-6 px-5 gap-4">
        <MenuItem icon="person-outline" title="Personal information" />
        <MenuItem icon="cube-outline" title="My orders"
          onPress={() => router.push("/Account/myOrder")}
        />

        <MenuItem
          icon="lock-closed-outline"
          title="Security"
          onPress={() => router.push("/Account/security")}
        />

        <MenuItem icon="headset-outline"
          title="Support"
          onPress={() => router.push("/Account/support")} />

        {/* Toggles */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center">
              <Icon name="moon-outline" size={20} />
            </View>
            <Text className="ml-3 text-base">Dark mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#D1D5DB", true: "#B13239" }}
            thumbColor={darkMode ? "#ffffff" : "#f4f3f4"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center">
              <Icon name="image-outline" size={20} />
            </View>
            <Text className="ml-3 text-base">Allow screenshot</Text>
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
        <TouchableOpacity className="flex-row items-center">
          <Icon
            name="log-out-outline"
            size={22}
            color="red"
            style={{ transform: [{ scaleX: -1 }] }}
          />
          <Text className="text-red-600 text-base ml-2">Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type MenuItemProps = {
  icon: string;
  title: string;
  onPress?: () => void;
};

const MenuItem = ({ icon, title, onPress }: MenuItemProps) => (
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
