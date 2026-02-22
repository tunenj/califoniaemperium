import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import StoreCard from "./StoreCard";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

// Define the Vendor interface based on your API response
interface Vendor {
  id: string;
  user: string;
  user_email: string;
  user_name: string;
  business_name: string;
  business_slug: string;
  business_type: string;
  business_email: string;
  business_phone: string;
  description: string;
  logo: string | null;
  banner: string | null;
  verification_status: string;
  is_verified: boolean;
  verified_at: string;
  is_active: boolean;
  is_accepting_orders: boolean;
  rating_average: string;
  rating_count: number;
  total_sales: number;
  return_policy: string;
  shipping_policy: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  created_at: string;
  updated_at: string;
  pending_products_count: number;
}

interface VendorsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Vendor[];
}

const FeaturedStores = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get top vendors from API
  const getTopVendors = useCallback((vendorsList: Vendor[]): Vendor[] => {
    // Filter active and verified vendors
    const activeVendors = vendorsList.filter(
      vendor => vendor.is_active && vendor.is_verified && vendor.is_accepting_orders
    );

    // Sort by: 1. rating (highest first), 2. total sales (highest first), 3. rating count
    return activeVendors.sort((a, b) => {
      // Compare by rating average
      const ratingA = parseFloat(a.rating_average) || 0;
      const ratingB = parseFloat(b.rating_average) || 0;
      
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      
      // If ratings are equal, compare by total sales
      if (b.total_sales !== a.total_sales) {
        return b.total_sales - a.total_sales;
      }
      
      // If sales are equal, compare by rating count
      return b.rating_count - a.rating_count;
    }).slice(0, 4); // Get top 4 vendors
  }, []);

  // Format rating display
  const formatRating = useCallback((rating: string) => {
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
  }, []);

  // Fetch vendors function wrapped in useCallback
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<VendorsResponse>(endpoints.getVendorList);
      
      if (response.data && response.data.results) {
        const topVendors = getTopVendors(response.data.results);
        setVendors(topVendors);
      } else {
        setVendors([]);
      }
    } catch (error: any) {
      console.error("Error fetching vendors:", error);
      setError(error.message || t('failed_to_load_vendors') || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, [getTopVendors, t]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleRetry = useCallback(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <View className="mt-2 px-4 bg-white rounded-2xl mx-2">
      {/* Header */}
      <View className="flex-row justify-between mb-3 mt-6">
        <View>
          <Text className="font-semibold text-base">
            {t("featured_stores") || "Featured Stores"}
          </Text>
          <Text className="text-xs text-gray-500">
            {t("discover_top_rated_vendors") || "Discover top-rated vendors"}
          </Text>
        </View>

        <TouchableOpacity 
          className="flex-row items-center space-x-1"
          onPress={() => router.push("/(customer)/store?showAll=true")}
        >
          <Text className="text-darkRed text-sm">
            {t("view_more") || "View more"}
          </Text>
          <AntDesign name="right" size={16} color={colors.darkRed} />
        </TouchableOpacity>
      </View>

      {/* Store Cards */}
      {loading ? (
        <View className="py-10 items-center justify-center">
          <ActivityIndicator size="large" color={colors.darkRed} />
          <Text className="text-gray-500 text-sm mt-2">
            {t('loading_stores') || "Loading stores..."}
          </Text>
        </View>
      ) : error ? (
        <View className="pb-4">
          <View className="bg-red-50 p-3 rounded-lg mb-3">
            <Text className="text-red-500 text-sm">
              {error}
            </Text>
            <TouchableOpacity 
              className="mt-2 bg-darkRed px-4 py-2 rounded-lg self-start"
              onPress={handleRetry}
            >
              <Text className="text-white text-sm">
                {t('retry') || "Try Again"}
              </Text>
            </TouchableOpacity>
          </View>
          {vendors.length === 0 && (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 text-base">
                {t('no_featured_stores') || "No featured stores available"}
              </Text>
            </View>
          )}
        </View>
      ) : vendors.length === 0 ? (
        <View className="items-center justify-center py-10">
          <Text className="text-gray-500 text-base">
            {t('no_featured_stores') || "No featured stores available"}
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between pb-4">
          {vendors.map((vendor) => (
            <StoreCard
              key={vendor.id}
              title={vendor.business_name}
              bg={vendor.banner}
              front={vendor.logo}
              rating={formatRating(vendor.rating_average)}
              sales={vendor.total_sales}
              isVerified={vendor.is_verified}
              onVisitStore={() =>
                router.push({
                  pathname: "/(customer)/store/[slug]",
                  params: {
                    id: vendor.id,
                    storeName: vendor.business_name,
                    slug: vendor.business_slug,
                    storeSlug: vendor.business_slug,
                  },
                })
              }
              onFollow={() => console.log("Follow", vendor.business_name)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default FeaturedStores;