import images from "@/constants/images";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image, ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const categories = [
    "All Store",
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports",
  ];

  return (
    <LinearGradient
      className="flex-1"
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
              <Ionicons name="notifications-outline" size={26} color="white" />
              {/* Notification Badge */}
              <View className="absolute -top-0.5 -right-1 bg-red-600 w-3 h-3 rounded-full" />
            </TouchableOpacity>

            <TouchableOpacity className="mx-2">
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
                    className={`text-base ${cat === "All Store" ? "font-bold" : "font-normal"
                      } text-white`}
                  >
                    {cat}
                  </Text>
                  {cat === "All Store" && (
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
                placeholder="Search products, stores..."
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
                  Holiday{"\n"}Style Rush
                </Text>

                {/* Image on the edge */}
                <Image
                  source={images.dashboardIcon}
                  className="absolute right-4 w-10 h-10 -top-1"
                  resizeMode="contain"
                />
              </View>


              {/* Inline wrapper for “On checkout” + pill */}
              <View className="mt-2 flex-row items-center">
                {/* Text on left in front */}
                <Text className="relative z-10 text-[12px] text-white font-medium">
                  On checkout
                </Text>

                {/* Pill on right behind */}
                <View className="absolute -right-9 top-0.5 bg-[#C7A66A] px-2 py-2 rounded-full w-24 z-0">
                  <Text className="text-[10px] font-semibold text-white text-center">
                    Extra 10% OFF
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <Text className="text-xs text-white opacity-90 mt-1">
                T&C Applies
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
                  zIndex: 1
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
                  zIndex: 2
                }}
              />
            </View>

          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;