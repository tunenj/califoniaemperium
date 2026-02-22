// components/explore/DashboardHeader.tsx
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useCallback, memo, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExploreSearch } from "@/context/ExploreSearchContext"; 
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive scale helper
const scale = (size: number) => (SCREEN_WIDTH / 390) * size;

const DashboardHeader = memo(() => {
  const { t } = useLanguage();
  const { setSearchQuery } = useExploreSearch(); 
  const { getItemCount, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [checkingMessages, setCheckingMessages] = useState(false);
  
  // Get cart item count
  const cartItemCount = getItemCount();

  // Get categories with safety checks
  const getCategories = () => {
    const categoryKeys = ["all_store", "electronics", "fashion", "home_garden", "sports"];
    return categoryKeys.map(key => {
      const translation = t(key);
      if (typeof translation === 'string' && translation.trim()) {
        return translation;
      }
      const fallbacks = ["All Store", "Electronics", "Fashion", "Home & Garden", "Sports"];
      const index = categoryKeys.indexOf(key);
      return fallbacks[index] || `Category ${index + 1}`;
    });
  };

  const categories = getCategories();

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
      // In a real app, you'd fetch unread count from API
      setUnreadMessages(0);
    } catch (error) {
      console.error('Error checking messages:', error);
    } finally {
      setCheckingMessages(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery.trim());
      router.push('/(customer)/explore');
    }
  }, [localSearchQuery, setSearchQuery, router]);

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
  }, []);

  const handleImageSearchPress = useCallback(() => {
    router.push('/(customer)/image-search');
  }, [router]);

  const handleCategoryPress = useCallback((category: string) => {
    setSearchQuery(category);
    router.push('/(customer)/explore');
  }, [setSearchQuery, router]);

  const handleCartPress = useCallback(() => {
    router.push("/(customer)/cart");
  }, [router]);

  const handleWishlistPress = useCallback(() => {
    router.push("/(customer)/wishlist");
  }, [router]);

  const handleMessagesPress = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/(auth)/signIn');
    } else {
      router.push("/(customer)/messages");
    }
  }, [router, isAuthenticated]);

  const handleProfilePress = useCallback(() => {
    if (isAuthenticated) {
      router.push("/(customer)/profile");
    } else {
      router.push('/(auth)/signIn');
    }
  }, [router, isAuthenticated]);

  const getSafeText = (translationKey: string, fallback: string) => {
    const text = t(translationKey);
    return typeof text === 'string' ? text : fallback;
  };

  return (
    <View className="rounded-b-2xl overflow-hidden">
      <LinearGradient
        className="w-full"
        style={{ 
          height: Platform.select({ 
            ios: scale(260), 
            android: scale(240) 
          }) 
        }}
        colors={["#B13239", "#4D0812"]}
        start={[0, 0]}
        end={[1, 0]}
      >
        <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
          <View className="flex-1 px-4">
            {/* Top Icons Row */}
            <View className="flex-row justify-end items-center pt-2 pb-1">
              {/* Messages Icon */}
              <TouchableOpacity 
                className="mx-2 relative"
                onPress={handleMessagesPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={isAuthenticated ? "mail" : "mail-outline"} 
                  size={Platform.select({ ios: 24, android: 26 })}
                  color="white" 
                />
                {isAuthenticated && unreadMessages > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-600 min-w-4 h-4 rounded-full items-center justify-center">
                    <Text className="text-white text-[10px] font-bold px-1">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </Text>
                  </View>
                )}
                {checkingMessages && isAuthenticated && (
                  <View className="absolute -top-1 -right-1">
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Profile Icon */}
              <TouchableOpacity
                className="mx-2"
                onPress={handleProfilePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons 
                  name={isAuthenticated ? "person" : "person-outline"} 
                  size={Platform.select({ ios: 26, android: 28 })}
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            {/* Horizontal Categories */}
            <View className="mb-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ 
                  paddingHorizontal: 4,
                  paddingVertical: Platform.select({ ios: 4, android: 2 })
                }}
                bounces={Platform.OS === 'ios'}
                overScrollMode={Platform.OS === 'ios' ? 'always' : 'never'}
              >
                {categories.map((cat, index) => {
                  const categoryText = cat || `Category ${index + 1}`;
                  return (
                    <TouchableOpacity
                      key={index}
                      className="px-3 py-2"
                      activeOpacity={0.7}
                      onPress={() => handleCategoryPress(categoryText)}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Text
                        className={`text-base ${
                          index === 0 ? "font-bold" : "font-normal"
                        } text-white`}
                        style={{ 
                          fontSize: scale(15),
                          opacity: index === 0 ? 1 : 0.9
                        }}
                      >
                        {categoryText}
                      </Text>
                      {index === 0 && (
                        <View className="absolute bottom-0 left-3 right-3 h-0.5 bg-white rounded-full" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Search Bar Row */}
            <View className="flex-row items-center">
              {/* Search Bar Container */}
              <View 
                className="flex-1 flex-row items-center bg-white rounded-full px-4"
                style={[
                  { 
                    height: Platform.select({ ios: 48, android: 52 }),
                  },
                  Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    },
                    android: {
                      elevation: 4,
                    },
                  })
                ]}
              >
                {/* Camera Icon */}
                <TouchableOpacity 
                  onPress={handleImageSearchPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="camera" size={scale(20)} color="#666" />
                </TouchableOpacity>
                
                <TextInput
                  placeholder={getSafeText("search", "Search products, stores...")}
                  placeholderTextColor="#999"
                  className="flex-1 mx-3 text-black"
                  style={{ 
                    fontSize: scale(14),
                    paddingVertical: Platform.select({ ios: 10, android: 8 }),
                    includeFontPadding: false,
                  }}
                  value={localSearchQuery}
                  onChangeText={setLocalSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
                
                {/* Android clear button */}
                {Platform.OS === 'android' && localSearchQuery ? (
                  <TouchableOpacity onPress={handleClearSearch}>
                    <Ionicons name="close-circle" size={scale(18)} color="#999" />
                  </TouchableOpacity>
                ) : null}
                
                <TouchableOpacity 
                  onPress={handleSearch}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="search" size={scale(20)} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Wishlist icon */}
              <TouchableOpacity 
                className="ml-3"
                onPress={handleWishlistPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={isAuthenticated ? "heart" : "heart-outline"} 
                  size={scale(22)}
                  color="#ffffff" 
                />
              </TouchableOpacity>

              {/* Cart icon */}
              <TouchableOpacity 
                className="ml-3 relative"
                onPress={handleCartPress}
                disabled={cartLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="shopping-cart" size={scale(22)} color="#ffffff" />
                
                {cartItemCount > 0 && (
                  <View className="absolute -top-2 -right-2 bg-red-600 min-w-5 h-5 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold px-1">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
                
                {cartLoading && cartItemCount === 0 && (
                  <View className="absolute -top-2 -right-2">
                    <ActivityIndicator 
                      size="small" 
                      color="#fbbf24" 
                    />
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