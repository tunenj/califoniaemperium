import React from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const categories = [
    "All Store",
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports",
  ];

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - Categories & Icons */}
        <View className="px-4 pt-3">
          {/* Icons Row on Top */}
          <View className="flex-row justify-end space-x-4 mb-3">
            <Ionicons name="mail-outline" size={24} color="black" />
            <Ionicons name="notifications-outline" size={24} color="black" />
            <AntDesign name="user" size={24} color="black" />
          </View>

          {/* Categories ScrollView Below */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat, index) => (
              <TouchableOpacity key={index} className="px-1.5 py-3 relative">
                <Text
                  className={`text-base ${
                    cat === "All Store"
                      ? "text-white font-bold"
                      : "text-white"
                  }`}
                >
                  {cat}
                </Text>
                {cat === "All Store" && (
                  <View className="absolute bottom-0 left-4 right-4 h-1 bg-white rounded-full" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center mx-4 my-4 px-4 bg-gray-100 rounded-full h-12">
          <Feather name="camera" size={20} color="#888" />
          <TextInput
            placeholder="Search products, stores..."
            placeholderTextColor="#888"
            className="flex-1 mx-3 text-base text-black"
          />
          <Ionicons name="search" size={20} color="#888" />
          {/* <AntDesign name="hearto" size={20} color="#888" /> */}
          <Feather name="shopping-cart" size={20} color="#888" />
        </View>
        {/* Banner Section */}
        <View className="mx-4 rounded-2xl overflow-hidden h-96 relative">
          {/* Background Image (Red holiday theme) */}
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1607083206968-13611f0d75db?w=800&q=80", // Red holiday background
            }}
            className="w-full h-full absolute"
            resizeMode="cover"
          >
            {/* Dark overlay for text readability */}
            <View className="absolute inset-0 bg-black/30" />
          </ImageBackground>

          {/* Text Content */}
          <View className="p-6 justify-end h-full">
            <Text className="text-4xl font-bold text-white mb-2">
              Holiday Style Rush
            </Text>
            <Text className="text-lg text-white mb-2">On checkout</Text>
            <View className="bg-yellow-400 self-start px-5 py-2 rounded-full mb-2">
              <Text className="text-base font-bold text-black">
                Extra 10% OFF
              </Text>
            </View>
            <Text className="text-sm text-white opacity-90">T&C Applies</Text>
          </View>

          {/* Product Showcase Images (Right side) */}
          <View className="absolute right-4 top-24 w-48">
            {/* Top product - jacket */}
            <Image
              source={{
                uri: "https://img.freepik.com/premium-photo/handsome-male-model-wearing-brown-jacket_171965-59239.jpg?w=360",
              }}
              className="w-full h-56 rounded-xl mb-3"
              resizeMode="cover"
            />
            {/* Bottom product - bag & shoes */}
            <Image
              source={{
                uri: "https://ghfempire.com/cdn/shop/products/image_9bb51a63-87bf-46ca-b52e-fbe2b4460f8d.jpg?v=1665018453",
              }}
              className="w-full h-40 rounded-xl"
              resizeMode="cover"
            />
          </View>
        </View>
        {/* You can continue adding more sections here (products grid, deals, etc.) */}
        <View className="h-20" /> {/* Spacer */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
