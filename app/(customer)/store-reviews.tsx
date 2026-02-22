import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLanguage } from '@/context/LanguageContext'; // Add import

export default function StoreReviewsScreen() {
  const router = useRouter();
  const { t } = useLanguage(); // Add hook
  const [activeTab, setActiveTab] = useState<"products" | "reviews">("reviews");

  const categories = [
    t('all_store'),
    t('electronics'),
    t('fashion'),
    t('home_garden'),
    t('sports'),
  ];

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color="#FBBF24"
          />
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* HEADER (FIXED) */}
      <View className="rounded-b-2xl overflow-hidden">
        <LinearGradient
          className="w-full min-h-60"
          colors={["#B13239", "#4D0812"]}
          start={[0, 0]}
          end={[1, 0]}
        >
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-end items-center px-4 pt-10">
              <TouchableOpacity className="mx-2">
                <Ionicons name="mail-outline" size={26} color="white" />
                <View className="absolute -top-1 -right-1 bg-red-600 w-3 h-3 rounded-full" />
              </TouchableOpacity>

              <TouchableOpacity className="mx-2">
                <Ionicons
                  name="notifications-outline"
                  size={26}
                  color="white"
                />
                <View className="absolute -top-1 -right-1 bg-red-600 w-3 h-3 rounded-full" />
              </TouchableOpacity>

              <TouchableOpacity className="mx-2">
                <MaterialIcons
                  name="person-outline"
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-6"
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {categories.map((cat) => (
                <TouchableOpacity key={cat} className="mr-3">
                  <Text
                    className={`text-base text-white ${cat === t('all_store') ? "font-bold" : "font-normal"
                      }`}
                  >
                    {cat}
                  </Text>
                  {cat === t('all_store') && (
                    <View className="h-1 bg-white rounded-full mt-1" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* SCROLLING CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* STORE CARD */}
        <View className="mx-4 bg-white rounded-xl overflow-hidden mt-4 shadow-sm">
          <Image
            source={require("../../assets/images/cover.png")}
            className="w-full h-40"
            resizeMode="cover"
          />

          <View className="p-4">
            <View className="flex-row justify-between">
              <View className="flex-row">
                <Image
                  source={require("../../assets/images/electronicsIcon.png")}
                  className="w-16 h-14 rounded-xl -mt-10 border border-white"
                />
                <View className="ml-2">
                  <Text className="font-bold text-white text-lg -mt-10 z-10">TechHub</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {t('store_description')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity className="bg-red-500 px-4 py-1 rounded-full relative bottom-4 left-3 z-10">
                <Text className="text-white text-xs font-semibold">{t('follow')}</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between mt-4">
              <View className="flex-row items-center">
                <View className="flex-row mr-1">
                  {renderStars(4)}
                  <Ionicons name="star-half" size={16} color="#FBBF24" />
                </View>
                <Text className="text-sm ml-2">
                  <Text className="font-bold">4.8</Text>
                  <Text className="text-gray-500"> {t('reviews_count', { count: 67 })}</Text>
                </Text>
              </View>
              <Text className="text-sm text-gray-500">{t('followers_count', { count: 2540 })}</Text>
              <Text className="text-sm text-gray-500">{t('products_count', { count: 4 })}</Text>
            </View>
          </View>
        </View>

        {/* REVIEWS TABS */}
        <View className="flex-row border-b border-gray-200 mx-4 mt-6">
          <TouchableOpacity
            className={`pb-3 mr-6 ${activeTab === "products" ? "border-b-2 border-red-500" : ""}`}
            onPress={() => router.push("/(customer)/store")}
          >
            <Text className={`font-bold ${activeTab === "products" ? "text-red-500" : "text-gray-400"}`}>
              {t('products_with_count', { count: 4 })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`pb-3 ${activeTab === "reviews" ? "border-b-2 border-red-500" : ""}`}
            onPress={() => setActiveTab("reviews")}
          >
            <Text className={`font-bold ${activeTab === "reviews" ? "text-red-500" : "text-gray-400"}`}>
              {t('reviews_with_count', { count: 0 })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* REVIEW FILTERS */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold">{t('reviews')}</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-red-500 mr-1">{t('sort_by')}</Text>
              <Ionicons name="chevron-down" size={16} color="#d13138" />
            </TouchableOpacity>
          </View>

          <View className="flex-row space-x-2 mb-6 gap-2">
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text>{t('all')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text>{t('stars_5')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text>{t('stars_4')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text>{t('stars_3')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NO REVIEWS STATE - EXACTLY AS IN IMAGE */}
        <View className="mx-4 mt-8 items-center">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <FontAwesome name="comment-o" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {t('no_reviews_yet')}
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            {t('be_first_to_review')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}