import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import StoreCard from "./StoreCard";
import images from "@/constants/images";
import { ChevronRight } from "lucide-react-native";
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

  // Static fallback card data with default images
  const cardData = [
    {
      id: "tech-store-nigeria-africa",
      title: t("tech_store_nigeria") || "Tech Store Nigeria",
      bg: images.electronicsBg,
      front: images.electronicsIcon,
      rating: "4.9",
      sales: 453,
      verified: true,
      business_slug: "tech-store-nigeria-africa" // Added business_slug for static data
    },
    {
      id: "fashion-hub",
      title: t("fashion_hub") || "Fashion Hub",
      bg: images.fashionBg,
      front: images.fashionIcon,
      rating: "4.5",
      sales: 464,
      verified: true,
      business_slug: "fashion-hub"
    },
    {
      id: "home-essentials",
      title: t("home_essentials") || "Home Essentials",
      bg: images.groceryBg,
      front: images.groceryIcon,
      rating: "3.8",
      sales: 171,
      verified: true,
      business_slug: "home-essentials"
    },
    {
      id: "electronics-plus",
      title: t("electronics_plus") || "Electronics Plus",
      bg: images.computerBg,
      front: images.computerIcon,
      rating: "4.0",
      sales: 78,
      verified: true,
      business_slug: "electronics-plus"
    }
  ];

  // Get business type icon based on business_type
  const getBusinessIcon = useCallback((businessType: string, index: number) => {
    const type = businessType.toLowerCase();
    if (type.includes('tech') || type.includes('electronic') || type.includes('gadget') || type.includes('it')) {
      return { bg: images.electronicsBg, front: images.electronicsIcon };
    } else if (type.includes('fashion') || type.includes('apparel') || type.includes('clothing')) {
      return { bg: images.fashionBg, front: images.fashionIcon };
    } else if (type.includes('home') || type.includes('kitchen') || type.includes('essential') || type.includes('grocery')) {
      return { bg: images.groceryBg, front: images.groceryIcon };
    } else {
      // Default fallback based on position in array
      const imageMap = [
        { bg: images.electronicsBg, front: images.electronicsIcon },
        { bg: images.fashionBg, front: images.fashionIcon },
        { bg: images.groceryBg, front: images.groceryIcon },
        { bg: images.computerBg, front: images.computerIcon },
      ];
      return imageMap[index % imageMap.length];
    }
  }, []);

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
        console.log("API returned no results, using static data");
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

  // Determine which data to display
  const displayData = vendors.length > 0 ? vendors : cardData;

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
          <ChevronRight size={16} color={colors.darkRed} />
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
        // Show error but still display static data
        <View className="pb-4">
          <View className="bg-red-50 p-3 rounded-lg mb-3">
            <Text className="text-red-500 text-sm">
              {error}. Showing sample stores.
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
          <View className="flex-row flex-wrap justify-between pb-4">
            {displayData.map((item, index) => {
              const isVendor = 'business_name' in item;
              const title = isVendor ? (item as Vendor).business_name : (item as any).title;
              const id = isVendor ? (item as Vendor).id : (item as any).id;
              const rating = isVendor ? formatRating((item as Vendor).rating_average) : (item as any).rating;
              const sales = isVendor ? (item as Vendor).total_sales : (item as any).sales;
              const verified = isVendor ? (item as Vendor).is_verified : (item as any).verified;
              const businessSlug = isVendor ? (item as Vendor).business_slug : (item as any).business_slug || id;
              const businessImages = isVendor 
                ? getBusinessIcon((item as Vendor).business_type, index)
                : { bg: (item as any).bg, front: (item as any).front };
              const bg = isVendor ? (item as Vendor).banner || businessImages.bg : (item as any).bg;
              const front = isVendor ? (item as Vendor).logo || businessImages.front : (item as any).front;
              
              return (
                <StoreCard
                  key={id}
                  title={title}
                  bg={bg}
                  front={front}
                  rating={rating}
                  sales={sales}
                  isVerified={verified}
                  onVisitStore={() =>
                    router.push({
                      pathname: "/(customer)/store/[slug]",
                      params: {
                        id: id,
                        storeName: title,
                        slug: businessSlug, // Required by the route
                        storeSlug: businessSlug, // Additional parameter if needed elsewhere
                      },
                    })
                  }
                  onFollow={() => console.log("Follow", title)}
                />
              );
            })}
          </View>
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between pb-4">
          {displayData.map((item, index) => {
            const isVendor = 'business_name' in item;
            const title = isVendor ? (item as Vendor).business_name : (item as any).title;
            const id = isVendor ? (item as Vendor).id : (item as any).id;
            const rating = isVendor ? formatRating((item as Vendor).rating_average) : (item as any).rating;
            const sales = isVendor ? (item as Vendor).total_sales : (item as any).sales;
            const verified = isVendor ? (item as Vendor).is_verified : (item as any).verified;
            const businessSlug = isVendor ? (item as Vendor).business_slug : (item as any).business_slug || id;
            const businessImages = isVendor 
              ? getBusinessIcon((item as Vendor).business_type, index)
              : { bg: (item as any).bg, front: (item as any).front };
            const bg = isVendor ? (item as Vendor).banner || businessImages.bg : (item as any).bg;
            const front = isVendor ? (item as Vendor).logo || businessImages.front : (item as any).front;
            
            return (
              <StoreCard
                key={id}
                title={title}
                bg={bg}
                front={front}
                rating={rating}
                sales={sales}
                isVerified={verified}
                onVisitStore={() =>
                  router.push({
                    pathname: "/(customer)/store/[slug]",
                    params: {
                      id: id,
                      storeName: title,
                      slug: businessSlug, // Required by the route
                      storeSlug: businessSlug, // Additional parameter if needed elsewhere
                    },
                  })
                }
                onFollow={() => console.log("Follow", title)}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export default FeaturedStores;