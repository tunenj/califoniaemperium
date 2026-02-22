// components/home/BestSellingProducts.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
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
  brand_name?: string;
  main_image?: string | null;
}

/* ================= COMPONENT ================= */
const BestSellingProducts = () => {
  const router = useRouter();
  const { t } = useLanguage();

  // Use the cart context
  const {
    addItem,
    isInCart,
    syncing: cartSyncing
  } = useCart();

  // Use the wishlist context
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistId,
  } = useWishlist();

  // Use auth context
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to track which products are being added to cart
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});

  // State to track which products are being toggled in wishlist
  const [togglingWishlist, setTogglingWishlist] = useState<{ [key: string]: boolean }>({});


  const formatPrice = useCallback((price: string | undefined | null) => {
    if (!price) return "$0.00";
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "$0.00";
    return `$${numPrice.toFixed(2)}`;
  }, []);

  const calculateDiscount = useCallback((price: string | undefined | null, comparePrice: string | null | undefined) => {
    if (!price || !comparePrice) return 0;
    const currentPrice = parseFloat(price);
    const originalPrice = parseFloat(comparePrice);
    if (isNaN(currentPrice) || isNaN(originalPrice) || originalPrice <= 0) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, []);

  const getRating = useCallback((rating: string | undefined | null) => {
    if (!rating) return "0.0";
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return "0.0";
    return numRating.toFixed(1);
  }, []);

  const getRatingCount = useCallback((count: number | undefined | null) => (count || count === 0 ? count : 0), []);

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
  const handleProductPress = useCallback((product: Product | null) => {
    if (!product?.slug) return;
    router.push({
      pathname: "/(customer)/product/[slug]",
      params: { slug: product.slug, productName: product.name || "Product" },
    });
  }, [router]);

  const handleAddToCart = useCallback(async (product: Product | null, event?: any) => {
    if (event) {
      event.stopPropagation();
    }

    if (!product?.id) return;

    // Check if product is in stock
    if (!product.is_in_stock) {
      Alert.alert(
        "Out of Stock",
        "This product is currently out of stock",
        [{ text: "OK" }]
      );
      return;
    }

    // Check if already in cart
    if (isInCart(product.id)) {
      Alert.alert(
        "Already in Cart",
        `${product.name} is already in your cart`,
        [{ text: "OK" }]
      );
      return;
    }

    // Set loading state for this specific product
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      // Prepare item data for the cart
      const itemData = {
        productId: product.id,
        storeName: product.brand_name || 'Unknown Store',
        productName: product.name,
        price: parseFloat(product.price),
        originalPrice: product.compare_at_price
          ? parseFloat(product.compare_at_price)
          : parseFloat(product.price),
        image: product.main_image || (product.images && product.images.length > 0 ? product.images[0] : null),
      };

      console.log('🛒 Adding product to cart:', itemData);

      // Add to cart via API
      const result = await addItem(itemData, 1);

      if (result.success) {
        console.log("✅ Added to cart:", product.name);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Error is already handled in the CartContext
    } finally {
      // Clear loading state for this product
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  }, [addItem, isInCart]);

  const handleWishlistToggle = useCallback(async (product: Product | null, event?: any) => {
    if (event) {
      event.stopPropagation();
    }

    if (!product?.id) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save items to your wishlist',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => router.push('/(auth)/signIn')
          }
        ]
      );
      return;
    }

    const productId = product.id;
    const isCurrentlyInWishlist = isInWishlist(productId);

    // Prevent multiple simultaneous operations on the same product
    if (togglingWishlist[productId]) {
      return;
    }

    // Set loading state for this specific product
    setTogglingWishlist(prev => ({ ...prev, [productId]: true }));

    try {
      if (isCurrentlyInWishlist) {
        // Get the wishlist ID for this product
        const wishlistId = getWishlistId(productId);

        if (!wishlistId) {
          console.error('[Wishlist] No wishlist ID found for product:', productId);
          Alert.alert('Error', 'Failed to remove from wishlist');
          setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
          return;
        }

        // Remove from wishlist using wishlist_id
        // This calls DELETE /orders/wishlist/:wishlist_id/
        const success = await removeFromWishlist(wishlistId);

        if (success) {
          console.log("✅ Removed from wishlist:", product.name);
        }
      } else {
        // Add to wishlist
        const result = await addToWishlist(productId);

        if (result.success) {
          console.log("✅ Added to wishlist:", product.name);
        }
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error);

      // Error is already handled in WishlistContext, but show a user-friendly message
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to update wishlist";

      Alert.alert(
        "Wishlist Error",
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      // Clear loading state for this product
      setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  }, [isAuthenticated, router, isInWishlist, addToWishlist, removeFromWishlist, getWishlistId, togglingWishlist]);

  // Check if a product is currently being added to cart
  const isAddingToCart = useCallback((productId: string) => {
    return addingToCart[productId] || false;
  }, [addingToCart]);

  // Check if wishlist operation is in progress for a product
  const isTogglingWishlist = useCallback((productId: string) => {
    return togglingWishlist[productId] || false;
  }, [togglingWishlist]);

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
          const isProductInCart = isInCart(product.id);
          const isProductAddingToCart = isAddingToCart(product.id);
          const isProductOutOfStock = !product.is_in_stock;
          const isProductInWishlist = isInWishlist(product.id);
          const isWishlistToggling = isTogglingWishlist(product.id);

          return (
            <TouchableOpacity
              key={product.id}
              className="w-[48%] mb-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 relative"
              onPress={() => handleProductPress(product)}
            >
              {/* Image Placeholder */}
              <View className="h-36 bg-gray-200 items-center justify-center">
                {discount > 0 && (
                  <View className="absolute top-2 left-2 bg-darkRed rounded-full px-2 py-1 z-10">
                    <Text className="text-white text-xs font-bold">-{discount}%</Text>
                  </View>
                )}

                {/* Wishlist Button */}
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md z-20"
                  onPress={(e) => handleWishlistToggle(product, e)}
                  disabled={isWishlistToggling}
                  style={{
                    opacity: isWishlistToggling ? 0.6 : 1,
                  }}
                >
                  {isWishlistToggling ? (
                    <ActivityIndicator size="small" color={colors.darkRed} />
                  ) : (
                    <AntDesign
                      name="heart"
                      size={16}
                      color={colors.darkRed}
                      style={{ color: isProductInWishlist ? colors.darkRed : colors.darkRed }}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View className="p-3">
                <Text className="text-sm font-semibold" numberOfLines={2} style={{ minHeight: 40 }}>
                  {product.name}
                </Text>
                <View className="flex-row items-center mb-1">
                  <AntDesign name="star" size={12} color="#FFD700" />
                  <Text className="text-xs ml-1">{rating}</Text>
                  <Text className="text-xs text-gray-500 ml-2">({ratingCount})</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-darkRed">{formatPrice(product.price)}</Text>

                  {/* Add to Cart Button */}
                  <TouchableOpacity
                    className={`p-2 rounded-lg ${isProductInCart ? 'bg-green-600' : 'bg-darkRed'}`}
                    onPress={(e) => handleAddToCart(product, e)}
                    disabled={isProductOutOfStock || isProductAddingToCart || cartSyncing}
                    style={{
                      opacity: isProductOutOfStock ? 0.5 : 1,
                      minWidth: 32,
                      minHeight: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isProductAddingToCart ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : isProductInCart ? (
                      <AntDesign name="check" size={16} color="white" />
                    ) : (
                      <Feather name="shopping-cart" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Optional: Show "In Cart" badge */}
              {isProductInCart && !isProductAddingToCart && (
                <View className="absolute bottom-3 left-2 bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
                  <Text className="text-xs text-green-800 font-medium">In Cart</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BestSellingProducts;