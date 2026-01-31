import images from "@/constants/images";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext"; // Add this import

const HomeScreen = () => {
  const { t } = useLanguage(); // Add this hook
  const router = useRouter();

  const categories = [
    t("all_store") || "All Store", // Use translation
    t("electronics") || "Electronics", // Use translation
    t("fashion") || "Fashion", // Use translation
    t("home_garden") || "Home & Garden", // Use translation
    t("sports") || "Sports", // Use translation
  ];

  return (
    <View className="rounded-b-3xl overflow-hidden">
      <LinearGradient
        className="h-96 w-full"
        colors={["#B13239", "#4D0812"]}
        start={[0, 0]}
        end={[1, 0]}
      >
        <SafeAreaView className="flex-1 ">
          <View className="flex-1">
            {/* Top Icons Row */}
            <View className="flex-row justify-end items-center px-4 pt-4 mb-1">
              <TouchableOpacity className="mx-2">
                <Ionicons name="mail-outline" size={26} color="white" />
                {/* Notification Badge */}
                <View className="absolute -top-0.5 -right-1 bg-red-600 w-3 h-3 rounded-full" />
              </TouchableOpacity>

              <TouchableOpacity className="mx-2 relative">
                <Ionicons
                  name="notifications-outline"
                  size={26}
                  color="white"
                />
                {/* Notification Badge */}
                <View className="absolute -top-0.5 -right-1 bg-red-600 w-3 h-3 rounded-full" />
              </TouchableOpacity>

              <TouchableOpacity
                className="mx-2"
                onPress={() => router.push('/(customer)/account')}
              >
                <MaterialIcons name="person-outline" size={28} color="white" />
              </TouchableOpacity>
            </View>

            {/* Horizontal Categories */}
            <View className="mb-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 3 }}
              >
                {categories.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    className="px-1.5 py-2"
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`text-base ${cat === categories[0] ? "font-bold" : "font-normal"
                        } text-white`}
                    >
                      {cat}
                    </Text>
                    {cat === categories[0] && (
                      <View className="absolute bottom-0 left-3 right-3 h-1 bg-white rounded-full" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center px-4">
              {/* Search Bar */}
              <View className="flex-1 flex-row items-center bg-white rounded-full h-10 px-4 shadow-md">
                <Feather name="camera" size={22} color="#666" />
                <TextInput
                  placeholder={t("search") || "Search products, stores..."} // Use translation
                  placeholderTextColor="#999"
                  className="flex-1 mx-3 text-base text-black"
                />
                <Ionicons name="search" size={22} color="#666" />
              </View>
              {/* Icons outside search bar */}
              <TouchableOpacity className="ml-4">
                <Ionicons name="heart-outline" size={24} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity className="ml-4">
                <Feather name="shopping-cart" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            {/* Banner Section */}
            <View className="mb-4 relative h-64 overflow-hidden">
              {/* Left Side - Text Content */}
              <View className="absolute left-3 top-8 max-w-[55%]">
                {/* Title */}
                <View className="relative inline-block">
                  <Text className="text-3xl font-bold text-white leading-tight">
                    {t("holiday_style_rush") || "Holiday\nStyle Rush"} {/* Use translation */}
                  </Text>

                  {/* Image on the edge */}
                  <Image
                    source={images.dashboardIcon}
                    className="absolute right-4 w-10 h-10 -top-1"
                    resizeMode="contain"
                  />
                </View>

                {/* Inline wrapper for "On checkout" + pill */}
                <View className="mt-2 flex-row items-center">
                  {/* Text on left in front */}
                  <Text className="relative z-10 text-[12px] text-white font-medium">
                    {t("on_checkout") || "On checkout"} {/* Use translation */}
                  </Text>

                  {/* Pill on right behind */}
                  <View className="absolute -right-7 top-0.5 bg-[#C7A66A] px-2 py-2 rounded-full w-24 z-0">
                    <Text className="text-[10px] font-semibold text-white text-center">
                      {t("extra_10_off") || "Extra 10% OFF"} {/* Use translation */}
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <Text className="text-xs text-white opacity-90 mt-1">
                  {t("terms_conditions_apply") || "T&C Applies"} {/* Use translation */}
                </Text>
              </View>

              {/* Product Images - Right Side */}
              <View className="absolute right-0 top-0 h-full w-48 flex-row">
                {/* Bottom Image (behind) - Shoe */}
                <Image
                  source={images.pairShoe}
                  className="w-32 h-48 rounded-2xl mx-1"
                  resizeMode="cover"
                  style={{
                    position: "absolute",
                    right: 5,
                    top: 35,
                    zIndex: 1,
                  }}
                />

                {/* Top Image (front) - Jacket */}
                <Image
                  source={images.jacket}
                  className="w-32 h-52 rounded-2xl mx-2"
                  resizeMode="cover"
                  style={{
                    position: "absolute",
                    right: 95,
                    top: 45,
                    zIndex: 2,
                  }}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default HomeScreen;