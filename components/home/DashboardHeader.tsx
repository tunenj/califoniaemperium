// app/(customer)/index.tsx
import images from "@/constants/images";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext";
import { useExploreSearch } from "@/context/ExploreSearchContext";
import { useCart } from "@/context/CartContext"; // Import cart context

const HomeScreen = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { setSearchQuery } = useExploreSearch();
  const { getItemCount, loading: cartLoading } = useCart(); // Get cart context
  
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Get cart item count
  const cartItemCount = getItemCount();

  // Get categories with safety checks
  const getCategories = () => {
    const categoryKeys = ["all_store", "electronics", "fashion", "home_garden", "sports"];
    return categoryKeys.map(key => {
      const translation = t(key);
      // Ensure we always return a string
      if (typeof translation === 'string' && translation.trim()) {
        return translation;
      }
      // Fallbacks
      const fallbacks = ["All Store", "Electronics", "Fashion", "Home & Garden", "Sports"];
      const index = categoryKeys.indexOf(key);
      return fallbacks[index] || `Category ${index + 1}`;
    });
  };

  const categories = getCategories();

  // Debug: Check for undefined text
  useEffect(() => {
    if (__DEV__) {
      const checkText = (value: any, location: string) => {
        if (value !== undefined && typeof value !== 'string') {
          console.warn(`Non-string text at ${location}:`, value);
        }
      };
      
      categories.forEach((cat, index) => checkText(cat, `categories[${index}]`));
    }
  }, [categories]);

  const handleSearch = () => {
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery.trim());
      router.push('/(customer)/explore');
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
  };

  const handleCategoryPress = (category: string) => {
    // Ensure category is a string
    const safeCategory = typeof category === 'string' ? category : '';
    setSearchQuery(safeCategory);
    router.push('/(customer)/explore');
  };

  // Navigate to cart screen
  const handleCartPress = () => {
    router.push("/(customer)/cart");
  };

  // Navigate to wishlist screen
  const handleWishlistPress = () => {
    router.push("/(customer)/wishlist");
  };

  // Navigate to notifications screen
  // const handleNotificationsPress = () => {
  //   router.push("/(customer)/notifications");
  // };

  // // Navigate to messages screen
  // const handleMessagesPress = () => {
  //   router.push("/(customer)/messages");
  // };

  // Helper function to safely get text
  const getSafeText = (translationKey: string, fallback: string) => {
    const text = t(translationKey);
    return typeof text === 'string' ? text : fallback;
  };

  return (
    <View className="rounded-b-3xl overflow-hidden">
      <LinearGradient
        className="h-96 w-full"
        colors={["#B13239", "#4D0812"]}
        start={[0, 0]}
        end={[1, 0]}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1">
            {/* Top Icons Row */}
            <View className="flex-row justify-end items-center px-4 pt-4 mb-1">
              {/* <TouchableOpacity 
                className="mx-2 relative"
                onPress={handleMessagesPress}
              >
                <Ionicons name="mail-outline" size={26} color="white" />
                <View className="absolute -top-0.5 -right-1 bg-red-600 w-3 h-3 rounded-full" />
              </TouchableOpacity> */}

              {/* <TouchableOpacity 
                className="mx-2 relative"
                onPress={handleNotificationsPress}
              >
                <Ionicons
                  name="notifications-outline"
                  size={26}
                  color="white"
                />
                <View className="absolute -top-0.5 -right-1 bg-red-600 w-3 h-3 rounded-full" />
              </TouchableOpacity> */}

              <TouchableOpacity
                className="mx-2"
                onPress={() => router.push('/Setup/profile-setup')}
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
                {categories.map((cat, index) => {
                  const categoryText = cat || `Category ${index + 1}`;
                  return (
                    <TouchableOpacity
                      key={index}
                      className="px-1.5 py-2"
                      activeOpacity={0.8}
                      onPress={() => handleCategoryPress(categoryText)}
                    >
                      <Text
                        className={`text-base ${
                          index === 0 ? "font-bold" : "font-normal"
                        } text-white`}
                      >
                        {categoryText}
                      </Text>
                      {index === 0 && (
                        <View className="absolute bottom-0 left-3 right-3 h-1 bg-white rounded-full" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center px-4">
              {/* Search Bar */}
              <View className="flex-1 flex-row items-center bg-white rounded-full h-12 px-4 shadow-md">
                <Feather name="camera" size={22} color="#666" />
                <TextInput
                  placeholder={getSafeText("search", "Search products, stores...")}
                  placeholderTextColor="#999"
                  className="flex-1 mx-3 text-base text-black"
                  value={localSearchQuery}
                  onChangeText={setLocalSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                {localSearchQuery ? (
                  <TouchableOpacity onPress={handleClearSearch}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity onPress={handleSearch}>
                  <Ionicons name="search" size={22} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Icons outside search bar */}
              <TouchableOpacity 
                className="ml-4"
                onPress={handleWishlistPress}
              >
                <Ionicons name="heart-outline" size={24} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity 
                className="ml-4 relative"
                onPress={handleCartPress}
                disabled={cartLoading}
              >
                <Feather name="shopping-cart" size={24} color="#ffffff" />
                
                {/* Cart badge with item count */}
                {cartItemCount > 0 && (
                  <View className="absolute -top-2 -right-2 bg-red-600 min-w-5 h-5 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold px-1">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
                
                {/* Loading indicator when cart is loading */}
                {cartLoading && cartItemCount === 0 && (
                  <View className="absolute -top-2 -right-2 bg-yellow-500 w-4 h-4 rounded-full items-center justify-center">
                    <View className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Banner Section */}
            <View className="mb-4 relative h-64 overflow-hidden">
              {/* Left Side - Text Content */}
              <View className="absolute left-3 top-8 max-w-[55%]">
                {/* Title */}
                <View className="relative inline-block">
                  <Text className="text-3xl font-bold text-white leading-tight">
                    {getSafeText("holiday_style_rush", "Holiday\nStyle Rush")}
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
                    {getSafeText("on_checkout", "On checkout")}
                  </Text>

                  {/* Pill on right behind */}
                  <View className="absolute -right-9 top-0.5 bg-[#C7A66A] px-2 py-2 rounded-full w-24 z-0">
                    <Text className="text-[10px] font-semibold text-white text-center">
                      {getSafeText("extra_10_off", "Extra 10% OFF")}
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <Text className="text-xs text-white opacity-90 mt-1">
                  {getSafeText("terms_conditions_apply", "T&C Applies")}
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