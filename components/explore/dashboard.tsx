import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const HomeScreen = () => {
  const categories = ["All Store", "Electronics", "Fashion", "Home & Garden", "Sports"];

  return (
   <View className="rounded-b-2xl overflow-hidden">
  <LinearGradient
    className="h-60 w-full"
    colors={["#B13239", "#4D0812"]}
    start={[0, 0]}
    end={[1, 0]}
  >
      <SafeAreaView className="flex-1">
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
          <View className="mb-6">
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
        </View>
      </SafeAreaView>
    </LinearGradient>
    </View>
  );
};

export default HomeScreen;