// app/(customer)/index.tsx
import images from "@/constants/images";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext";
import { useExploreSearch } from "@/context/ExploreSearchContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scale helpers
const scale = (size: number) => (SCREEN_WIDTH / 390) * size;
const isSmallDevice = SCREEN_HEIGHT < 700;
const isLargeDevice = SCREEN_HEIGHT > 850;

const HomeScreen = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { setSearchQuery } = useExploreSearch();
  const { getItemCount, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [checkingMessages, setCheckingMessages] = useState(false);

  const cartItemCount = getItemCount();

  useEffect(() => {
    if (isAuthenticated) {
      checkUnreadMessages();
    } else {
      setUnreadMessages(0);
    }
  }, [isAuthenticated]);

  const checkUnreadMessages = async () => {
    setCheckingMessages(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;
      setUnreadMessages(0);
    } catch (error) {
      console.error('Error checking messages:', error);
    } finally {
      setCheckingMessages(false);
    }
  };

  const getCategories = () => {
    const categoryKeys = ["all_store", "electronics", "fashion", "home_garden", "sports"];
    return categoryKeys.map((key, index) => {
      const translation = t(key);
      if (typeof translation === 'string' && translation.trim()) return translation;
      const fallbacks = ["All Store", "Electronics", "Fashion", "Home & Garden", "Sports"];
      return fallbacks[index] || `Category ${index + 1}`;
    });
  };

  const categories = getCategories();

  const handleSearch = () => {
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery.trim());
      router.push('/(customer)/explore');
    }
  };

  const handleClearSearch = () => setLocalSearchQuery('');

  const handleCategoryPress = (category: string) => {
    setSearchQuery(typeof category === 'string' ? category : '');
    router.push('/(customer)/explore');
  };

  const handleImageSearchPress = () => router.push('/(customer)/image-search');
  const handleCartPress = () => router.push("/(customer)/cart");
  const handleWishlistPress = () => router.push("/(customer)/wishlist");

  const handleMessagesPress = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/signIn');
    } else {
      router.push("/(customer)/messages");
    }
  };

  const getSafeText = (key: string, fallback: string) => {
    const text = t(key);
    return typeof text === 'string' ? text : fallback;
  };

  // Responsive banner height: smaller on small devices, larger on big ones
  const bannerHeight = isSmallDevice ? 180 : isLargeDevice ? 200 : 200;

  return (
    <View className="rounded-b-2xl overflow-hidden">
      <LinearGradient
        colors={["#B13239", "#4D0812"]}
        start={[0, 0]}
        end={[1, 0]}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View className="pb-4">

            {/* ── Top Icons Row ─────────────────────────────────────── */}
            <View
              className="flex-row justify-end items-center px-4"
              style={{
                paddingTop: Platform.OS === 'ios' ? 4 : 12,
                marginBottom: 4,
              }}
            >
              {/* Messages */}
              <TouchableOpacity
                className="mx-2 relative"
                onPress={handleMessagesPress}
              >
                <Ionicons
                  name={isAuthenticated ? "mail" : "mail-outline"}
                  size={scale(26)}
                  color="white"
                />
                {isAuthenticated && unreadMessages > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-600 min-w-[16px] h-4 rounded-full items-center justify-center">
                    <Text className="text-white text-[10px] font-bold px-0.5">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Profile */}
              <TouchableOpacity
                className="mx-2"
                onPress={() => router.push(isAuthenticated ? '/(customer)/profile' : '/(auth)/signIn')}
              >
                <MaterialIcons
                  name={isAuthenticated ? "person" : "person-outline"}
                  size={scale(28)}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {/* ── Categories ────────────────────────────────────────── */}
            <View className="mb-3">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
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
                        className="text-white"
                        style={{
                          fontSize: scale(15),
                          fontWeight: index === 0 ? '700' : '400',
                        }}
                      >
                        {categoryText}
                      </Text>
                      {index === 0 && (
                        <View className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Search Bar ────────────────────────────────────────── */}
            <View className="flex-row items-center px-4 mb-2">
              {/* Input */}
              <View className="flex-1 flex-row items-center bg-white rounded-full shadow-md elevation-4"
                style={{
                  height: scale(46),
                  paddingHorizontal: 14,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                }}
              >
                <TouchableOpacity onPress={handleImageSearchPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="camera" size={scale(20)} color="#666" />
                </TouchableOpacity>

                <TextInput
                  placeholder={getSafeText("search", "Search products, stores...")}
                  placeholderTextColor="#999"
                  className="flex-1 mx-2 text-gray-900"
                  style={{
                    fontSize: scale(14),
                    paddingVertical: 0,
                  }}
                  value={localSearchQuery}
                  onChangeText={setLocalSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />

                {localSearchQuery ? (
                  <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={scale(20)} color="#999" />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity onPress={handleSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="search" size={scale(20)} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Wishlist */}
              <TouchableOpacity
                className="ml-3.5"
                onPress={handleWishlistPress}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Ionicons
                  name={isAuthenticated ? "heart" : "heart-outline"}
                  size={scale(24)}
                  color="white"
                />
              </TouchableOpacity>

              {/* Cart */}
              <TouchableOpacity
                className="ml-3.5 relative"
                onPress={handleCartPress}
                disabled={cartLoading}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Feather name="shopping-cart" size={scale(24)} color="white" />
                {cartItemCount > 0 && (
                  <View className="absolute -top-2 -right-2 bg-red-600 min-w-[18px] h-[18px] rounded-full items-center justify-center">
                    <Text className="text-white text-[10px] font-bold px-0.5">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Banner ────────────────────────────────────────────── */}
            <View
              className="relative overflow-hidden"
              style={{
                height: bannerHeight,
                marginHorizontal: 0,
              }}
            >
              {/* Text Content */}
              <View
                className="absolute left-4 z-10"
                style={{
                  top: scale(24),
                  maxWidth: SCREEN_WIDTH * 0.52,
                }}
              >
                <View className="relative">
                  <Text
                    className="text-white font-bold"
                    style={{
                      fontSize: scale(28),
                      lineHeight: scale(34),
                    }}
                  >
                    {getSafeText("holiday_style_rush", "Holiday\nStyle Rush")}
                  </Text>
                  <Image
                    source={images.dashboardIcon}
                    className="absolute"
                    style={{
                      right: scale(12),
                      top: -4,
                      width: scale(36),
                      height: scale(36),
                    }}
                    resizeMode="contain"
                  />
                </View>

                <View className="mt-2 flex-row items-center">
                  <Text className="text-white text-xs font-medium z-10">
                    {getSafeText("on_checkout", "On checkout")}
                  </Text>
                  <View
                    className="absolute bg-[#C7A66A] rounded-full items-center justify-center"
                    style={{
                      right: -scale(30),
                      top: 0,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      width: scale(88),
                    }}
                  >
                    <Text className="text-white text-[10px] font-semibold text-center">
                      {getSafeText("extra_10_off", "Extra 10% OFF")}
                    </Text>
                  </View>
                </View>

                <Text className="text-white/85 text-xs mt-1.5">
                  {getSafeText("terms_conditions_apply", "T&C Applies")}
                </Text>
              </View>

              {/* Right-side product images */}
              <View
                className="absolute right-0 top-0 bottom-0"
                style={{ width: SCREEN_WIDTH * 0.52 }}
              >
                {/* Back image - shoe */}
                <Image
                  source={images.pairShoe}
                  className="absolute rounded-2xl"
                  style={{
                    right: 4,
                    top: bannerHeight * 0.11,
                    width: scale(118),
                    height: bannerHeight * 0.72,
                    zIndex: 1,
                  }}
                  resizeMode="cover"
                />
                {/* Front image - jacket */}
                <Image
                  source={images.jacket}
                  className="absolute rounded-2xl"
                  style={{
                    right: scale(90),
                    top: bannerHeight * 0.2,
                    width: scale(118),
                    height: bannerHeight * 0.8,
                    zIndex: 2,
                  }}
                  resizeMode="cover"
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