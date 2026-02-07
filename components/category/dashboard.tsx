// components/explore/DashboardHeader.tsx
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useCallback, memo } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExploreSearch } from "@/context/ExploreSearchContext"; 
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext"; // Import cart context
import { useRouter } from "expo-router"; // Import router for navigation

const DashboardHeader = memo(() => {
  const { t } = useLanguage();
  const { searchQuery, setSearchQuery } = useExploreSearch(); 
  const { getItemCount, loading: cartLoading } = useCart(); // Get cart count
  const router = useRouter(); // Initialize router
  
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  
  // Get cart item count
  const cartItemCount = getItemCount();

  const categories = ["All Store", "Electronics", "Fashion", "Home & Garden", "Sports"];

  // Sync local search with context
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  const handleSearch = useCallback(() => {
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery.trim());
    }
  }, [localSearchQuery, setSearchQuery]);

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleCategoryPress = useCallback((category: string) => {
    setSearchQuery(category);
  }, [setSearchQuery]);

  // Navigate to cart screen
  const handleCartPress = useCallback(() => {
    router.push("/(customer)/cart");
  }, [router]);

  // Navigate to wishlist screen
  const handleWishlistPress = useCallback(() => {
    router.push("/(customer)/wishlist");
  }, [router]);

  // Navigate to notifications screen
  // const handleNotificationsPress = useCallback(() => {
  //   router.push("/(customer)/notifications");
  // }, [router]);

  // // Navigate to messages screen
  // const handleMessagesPress = useCallback(() => {
  //   router.push("/(customer)/messages");
  // }, [router]);

  // // Navigate to profile screen
  // const handleProfilePress = useCallback(() => {
  //   router.push("/(customer)/profile");
  // }, [router]);

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
              {/* Email icon with badge */}
              <View className="mx-2 relative">
                {/* <TouchableOpacity onPress={handleMessagesPress}>
                  <Ionicons name="mail-outline" size={26} color="white" />
                </TouchableOpacity> */}
                <View className="absolute -top-0.5 -right-1 bg-red-600 w-3 h-3 rounded-full" />
              </View>

              {/* Notifications icon with badge */}
              {/* <View className="mx-2 relative">
                <TouchableOpacity onPress={handleNotificationsPress}>
                  <Ionicons name="notifications-outline" size={26} color="white" />
                </TouchableOpacity>
                <View className="absolute -top-0.5 -right-1 bg-red-600 w-3 h-3 rounded-full" />
              </View> */}
              
              {/* Profile icon */}
              {/* <View className="mx-2">
                <TouchableOpacity onPress={handleProfilePress}>
                  <MaterialIcons name="person-outline" size={28} color="white" />
                </TouchableOpacity>
              </View> */}
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
                    key={`category-${index}-${cat}`}
                    className="px-1.5 py-2"
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(cat)}
                  >
                    <Text
                      className={`text-base ${
                        searchQuery === cat ? "font-bold" : "font-normal"
                      } text-white`}
                    >
                      {cat}
                    </Text>
                    {searchQuery === cat && (
                      <View className="absolute bottom-0 left-3 right-3 h-1 bg-white rounded-full" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center px-4">
              {/* Search Bar */}
              <View className="flex-1 flex-row items-center bg-white rounded-full h-16 px-4 shadow-md">
                <Feather name="camera" size={22} color="#666" />
                <TextInput
                  placeholder={t("search_products") || "Search for products..."}
                  placeholderTextColor="#999"
                  className="flex-1 mx-3 text-base text-black"
                  value={localSearchQuery}
                  onChangeText={setLocalSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                
                {/* Clear button when there's text */}
                {localSearchQuery ? (
                  <TouchableOpacity onPress={handleClearSearch}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                ) : null}
                
                {/* Search button */}
                <TouchableOpacity onPress={handleSearch}>
                  <Ionicons name="search" size={22} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Wishlist icon */}
              <TouchableOpacity 
                className="ml-4"
                onPress={handleWishlistPress}
              >
                <Ionicons name="heart-outline" size={24} color="#ffffff" />
              </TouchableOpacity>

              {/* Cart icon with badge */}
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
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;