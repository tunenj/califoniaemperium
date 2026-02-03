// components/home/TrendingProducts.tsx - Grid (4 items) without images
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Heart,
  ShoppingCart,
  Star,
  Image as ImageIcon,
} from "lucide-react-native";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/api/api";
import { endpoints } from "@/api/endpoints";

/* ================= INTERFACES ================= */

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  icon: string;
  parent: string;
  children: any[];
  full_path: string;
  order: number;
  is_active: boolean;
  product_count: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  website: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

interface Variant {
  id: string;
  sku: string;
  name: string;
  options: {
    Size?: string;
    Color?: string;
  };
  price_adjustment: string;
  final_price: string;
  stock_quantity: number;
  is_active: boolean;
  image: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Attribute {
  id: string;
  name: string;
  value: string;
  order: number;
}

interface VendorInfo {
  vendor_name: string;
  vendor_id: string;
  is_approved: boolean;
}

interface Product {
  id: string;
  product_type: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  category: Category;
  brand: Brand;
  tags: string[];
  price: string;
  compare_at_price: string | null;
  discount_percentage: number;
  stock_quantity: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  track_inventory: boolean;
  weight: string;
  length: string | null;
  width: string | null;
  height: string | null;
  condition: string;
  is_active: boolean;
  is_featured: boolean;
  requires_shipping: boolean;
  is_digital: boolean;
  images: any[];
  variants: Variant[];
  attributes: Attribute[];
  view_count: number;
  purchase_count: number;
  rating_average: string;
  rating_count: number;
  vendor_info: VendorInfo;
  dropship_info: any;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
  published_at: string;
}

interface TrendingProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
}

/* ================= COMPONENT ================= */

const TrendingProducts = () => {
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

    return `₦${numPrice.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateDiscount = (
    price: string | undefined | null,
    comparePrice: string | null | undefined
  ) => {
    if (!price || !comparePrice) return 0;

    const currentPrice = parseFloat(price);
    const originalPrice = parseFloat(comparePrice);

    if (
      isNaN(currentPrice) ||
      isNaN(originalPrice) ||
      originalPrice <= 0
    )
      return 0;

    const discount =
      ((originalPrice - currentPrice) / originalPrice) * 100;

    return Math.round(discount);
  };

  const getRating = (rating: string | undefined | null) => {
    if (!rating) return "0.0";

    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return "0.0";

    return numRating.toFixed(1);
  };

  const getRatingCount = (count: number | undefined | null) => {
    if (!count && count !== 0) return 0;
    return count;
  };

  const getCategoryIcon = (categoryName: string | undefined) => {
    const name = (categoryName || "").toLowerCase();

    if (
      name.includes("fashion") ||
      name.includes("clothing") ||
      name.includes("shoes")
    )
      return "👕";
    if (
      name.includes("electronics") ||
      name.includes("smartphone")
    )
      return "📱";
    if (name.includes("home")) return "🏠";
    if (name.includes("gaming")) return "🎮";
    if (name.includes("audio")) return "🎧";
    if (name.includes("watch")) return "⌚";
    if (name.includes("computer")) return "💻";

    return "📦";
  };

  /* ---------- Fetch ---------- */

  const fetchTrendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<TrendingProductsResponse>(
        endpoints.trendingProducts
      );

      if (response.data?.success && Array.isArray(response.data.data)) {
        const sortedProducts = [...response.data.data].sort(
          (a, b) => (b.view_count || 0) - (a.view_count || 0)
        );

        setProducts(sortedProducts.slice(0, 4));
      } else {
        setError(
          response.data?.message ||
            t("failed_to_load_products") ||
            "Failed to load products"
        );
        setProducts([]);
      }
    } catch (err: any) {
      console.error("Trending error:", err);
      setError(
        err?.message ||
          t("failed_to_load_products") ||
          "Failed to load products"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTrendingProducts();
  }, [fetchTrendingProducts]);

  /* ---------- Actions ---------- */

  const handleProductPress = (product: Product | null) => {
    if (!product?.slug) return;

    router.push({
      pathname: "/(customer)/product/[slug]",
      params: {
        slug: product.slug,
        productName: product.name || "Product",
      },
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

  /* ---------- Loading ---------- */

  if (loading) {
    return (
      <View className="py-10 items-center justify-center">
        <ActivityIndicator size="large" color={colors.darkRed} />
        <Text className="text-gray-500 text-sm mt-2">
          {t("loading_products") ||
            "Loading trending products..."}
        </Text>
      </View>
    );
  }

  /* ---------- Error ---------- */

  if (error) {
    return (
      <View className="py-10 items-center justify-center px-6">
        <Text className="text-red-500 text-center mb-3">
          {error}
        </Text>

        <TouchableOpacity
          onPress={fetchTrendingProducts}
          className="bg-darkRed px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">
            {t("retry") || "Retry"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ---------- Main UI ---------- */

  return (
    <View className="mt-6 px-2">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-lg font-bold text-gray-800">
            {t("trending_products") || "Trending Products"}
          </Text>
          <Text className="text-sm text-gray-500">
            {t("most_viewed_this_week") ||
              "Most viewed this week"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(customer)/explore")}
        >
          <Text className="text-darkRed text-sm font-medium">
            {t("view_all") || "View all"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid Layout */}
      <View className="flex-row flex-wrap justify-between">
        {products.map((product) => {
          if (!product) return null;

          const discount = calculateDiscount(
            product.price,
            product.compare_at_price
          );

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

                <View className="absolute bottom-2 bg-black/60 rounded-full px-3 py-1 flex-row items-center">
                  <ImageIcon size={12} color="white" />
                  <Text className="text-white text-xs ml-1">
                    {t("image_coming_soon") ||
                      "Image coming soon"}
                  </Text>
                </View>

                {discount > 0 && (
                  <View className="absolute top-2 left-2 bg-darkRed rounded-full px-2 py-1">
                    <Text className="text-white text-xs font-bold">
                      -{discount}%
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  className="absolute bottom-2 right-2 bg-white p-2 rounded-full"
                  onPress={() =>
                    handleAddToWishlist(product)
                  }
                >
                  <Heart
                    size={16}
                    color={colors.darkRed}
                  />
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View className="p-3">
                <Text
                  className="text-sm font-semibold"
                  numberOfLines={2}
                  style={{ minHeight: 40 }}
                >
                  {product.name}
                </Text>

                <View className="flex-row items-center mb-1">
                  <Star
                    size={12}
                    color="#FFD700"
                    fill="#FFD700"
                  />
                  <Text className="text-xs ml-1">
                    {rating}
                  </Text>
                  <Text className="text-xs text-gray-500 ml-2">
                    ({ratingCount})
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-darkRed">
                    {formatPrice(product.price)}
                  </Text>

                  <TouchableOpacity
                    className="bg-darkRed p-2 rounded-lg"
                    onPress={() =>
                      handleAddToCart(product)
                    }
                    disabled={!product.is_in_stock}
                  >
                    <ShoppingCart
                      size={16}
                      color="white"
                    />
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

export default TrendingProducts;
