// components/home/BestSellingProducts.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Heart, ShoppingCart, Star } from "lucide-react-native";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";

/* ================= TYPES ================= */
interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  is_in_stock: boolean;
  rating_average: string;
  rating_count: number;
  category: { name: string | undefined };
  images: any[];
}

/* ================= COMPONENT ================= */
const BestSellingProducts = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Helpers ---------- */
  const formatPrice = (price: string | undefined | null) => {
    if (!price) return "₦0";
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "₦0";
    return `₦${numPrice.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const calculateDiscount = (price: string | undefined | null, comparePrice: string | null | undefined) => {
    if (!price || !comparePrice) return 0;
    const currentPrice = parseFloat(price);
    const originalPrice = parseFloat(comparePrice);
    if (isNaN(currentPrice) || isNaN(originalPrice) || originalPrice <= 0) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const getRating = (rating: string | undefined | null) => {
    if (!rating) return "0.0";
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return "0.0";
    return numRating.toFixed(1);
  };

  const getRatingCount = (count: number | undefined | null) => (count || count === 0 ? count : 0);

  const getCategoryIcon = (categoryName: string | undefined) => {
    const name = (categoryName || "").toLowerCase();
    if (name.includes("fashion") || name.includes("clothing") || name.includes("shoes")) return "👕";
    if (name.includes("electronics") || name.includes("smartphone")) return "📱";
    if (name.includes("home")) return "🏠";
    if (name.includes("gaming")) return "🎮";
    if (name.includes("audio")) return "🎧";
    if (name.includes("watch")) return "⌚";
    if (name.includes("computer")) return "💻";
    return "📦";
  };

  /* ---------- Fetch ---------- */
  const fetchBestSellingProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(endpoints.bestSellingProducts);

      // Use response.data.data instead of response.data
      if (response.data?.success && Array.isArray(response.data.data)) {
        setProducts(response.data.data.slice(0, 4)); // top 4
      } else {
        setError(response.data?.message || t("failed_to_load_products") || "Failed to load products");
      }
    } catch (err: any) {
      console.error("Best Selling error:", err);
      setError(err?.message || t("failed_to_load_products") || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [t]);


  useEffect(() => {
    fetchBestSellingProducts();
  }, [fetchBestSellingProducts]);

  /* ---------- Actions ---------- */
  const handleProductPress = (product: Product | null) => {
    if (!product?.slug) return;
    router.push({
      pathname: "/(customer)/product/[slug]",
      params: { slug: product.slug, productName: product.name || "Product" },
    });
  };

  const handleAddToCart = (product: Product | null) => {
    if (!product?.id) return;
    console.log("Add to cart:", product.id);
  };

  const handleAddToWishlist = (product: Product | null) => {
    if (!product?.id) return;
    console.log("Add to wishlist:", product.id);
  };

  /* ---------- Loading/Error ---------- */
  if (loading) {
    return (
      <View className="py-10 items-center justify-center">
        <ActivityIndicator size="large" color={colors.darkRed} />
        <Text className="text-gray-500 text-sm mt-2">{t("loading_products") || "Loading products..."}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-10 items-center justify-center px-6">
        <Text className="text-red-500 text-center mb-3">{error}</Text>
        <TouchableOpacity onPress={fetchBestSellingProducts} className="bg-darkRed px-4 py-2 rounded-lg">
          <Text className="text-white font-medium">{t("retry") || "Retry"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ---------- Main UI ---------- */
  return (
    <View className="mt-0.5 bg-white rounded-2xl mx-2">
      {/* Header */}
      <View className="mb-2 px-4 mt-6 flex-row justify-between items-center">
        <View>
          <Text className="font-semibold text-base text-black">{t("best_selling_products") || "Best Selling Products"}</Text>
          <Text className="text-xs text-black">{t("top_sellers_for_you") || "Top sellers for you"}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(customer)/explore")}>
          <Text className="text-darkRed text-sm font-medium">{t("view_all") || "View all"}</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View className="flex-row flex-wrap justify-between px-4 mt-4">
        {products.map((product) => {
          const discount = calculateDiscount(product.price, product.compare_at_price);
          const rating = getRating(product.rating_average);
          const ratingCount = getRatingCount(product.rating_count);
          const icon = getCategoryIcon(product.category?.name);

          return (
            <TouchableOpacity
              key={product.id}
              className="w-[48%] mb-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              onPress={() => handleProductPress(product)}
            >
              {/* Image Placeholder */}
              <View className="h-36 bg-gray-200 items-center justify-center">
                <Text className="text-3xl">{icon}</Text>
                {discount > 0 && (
                  <View className="absolute top-2 left-2 bg-darkRed rounded-full px-2 py-1">
                    <Text className="text-white text-xs font-bold">-{discount}%</Text>
                  </View>
                )}
                <TouchableOpacity
                  className="absolute bottom-2 right-2 bg-white p-2 rounded-full"
                  onPress={() => handleAddToWishlist(product)}
                >
                  <Heart size={16} color={colors.darkRed} />
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View className="p-3">
                <Text className="text-sm font-semibold" numberOfLines={2} style={{ minHeight: 40 }}>
                  {product.name}
                </Text>
                <View className="flex-row items-center mb-1">
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text className="text-xs ml-1">{rating}</Text>
                  <Text className="text-xs text-gray-500 ml-2">({ratingCount})</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-darkRed">{formatPrice(product.price)}</Text>
                  <TouchableOpacity
                    className="bg-darkRed p-2 rounded-lg"
                    onPress={() => handleAddToCart(product)}
                    disabled={!product.is_in_stock}
                  >
                    <ShoppingCart size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BestSellingProducts;
