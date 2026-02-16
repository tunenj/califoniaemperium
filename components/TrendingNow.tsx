// components/home/TrendingProducts.tsx - Grid (4 items) with real images
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
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

interface ProductImage {
  id: string;
  image: string;
  alt_text: string;
  is_primary: boolean;
  order: number;
  created_at: string;
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
  images: ProductImage[];
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
  brand_name?: string;
  main_image?: string | null;
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
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  
  // State to track which products are being added to cart
  const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({});
  
  // State to track which products are being toggled in wishlist
  const [togglingWishlist, setTogglingWishlist] = useState<{[key: string]: boolean}>({});

  /* ---------- Helpers ---------- */

  const formatPrice = useCallback((price: string | undefined | null) => {
    if (!price) return "₦0";
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "₦0";
    return `₦${numPrice.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const calculateDiscount = useCallback((
    price: string | undefined | null,
    comparePrice: string | null | undefined
  ) => {
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

  const getRatingCount = useCallback((count: number | undefined | null) => {
    if (!count && count !== 0) return 0;
    return count;
  }, []);

  // Helper to get product image URL
  const getProductImageUrl = useCallback((product: Product): string | null => {
    // Priority 1: Check main_image field
    if (product.main_image) {
      return product.main_image;
    }
    
    // Priority 2: Check images array
    if (product.images && product.images.length > 0) {
      // Find primary image
      const primaryImage = product.images.find(img => img.is_primary);
      if (primaryImage?.image) {
        return primaryImage.image;
      }
      // Fallback to first image
      return product.images[0]?.image || null;
    }
    
    return null;
  }, []);

  const handleImageError = useCallback((productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  }, []);

  /* ---------- Fetch ---------- */

  const fetchTrendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setImageErrors({});

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

  const handleProductPress = useCallback((product: Product | null) => {
    if (!product?.slug) return;
    router.push({
      pathname: "/(customer)/product/[slug]",
      params: {
        slug: product.slug,
        productName: product.name || "Product",
      },
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
      // Get product image
      const productImage = getProductImageUrl(product);

      // Prepare item data for the cart
      const itemData = {
        productId: product.id,
        storeName: product.brand?.name || product.brand_name || 'Unknown Store',
        productName: product.name,
        price: parseFloat(product.price),
        originalPrice: product.compare_at_price 
          ? parseFloat(product.compare_at_price)
          : parseFloat(product.price),
        image: productImage,
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
  }, [addItem, isInCart, getProductImageUrl]);

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

  /* ---------- Loading ---------- */

  if (loading) {
    return (
      <View className="py-10 items-center justify-center">
        <ActivityIndicator size="large" color={colors.darkRed} />
        <Text className="text-gray-500 text-sm mt-2">
          {t("loading_products") || "Loading trending products..."}
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
            {t("most_viewed_this_week") || "Most viewed this week"}
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
          const isProductInCart = isInCart(product.id);
          const isProductAddingToCart = isAddingToCart(product.id);
          const isProductOutOfStock = !product.is_in_stock;
          const isProductInWishlist = isInWishlist(product.id);
          const isWishlistToggling = isTogglingWishlist(product.id);
          
          const productImage = getProductImageUrl(product);
          const hasImageError = imageErrors[product.id] || false;

          return (
            <TouchableOpacity
              key={product.id}
              className="w-[48%] mb-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 relative"
              onPress={() => handleProductPress(product)}
            >
              {/* Product Image */}
              <View className="h-36 bg-gray-200 items-center justify-center overflow-hidden">
                {productImage && !hasImageError ? (
                  <Image
                    source={{ uri: productImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onError={() => handleImageError(product.id)}
                  />
                ) : (
                  <View className="items-center justify-center">
                    <MaterialIcons name="image" size={32} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs mt-1">
                      {product.category?.name || "Product"}
                    </Text>
                  </View>
                )}

                {discount > 0 && (
                  <View className="absolute top-2 left-2 bg-darkRed rounded-full px-2 py-1 z-10">
                    <Text className="text-white text-xs font-bold">
                      -{discount}%
                    </Text>
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
                  ) : isProductInWishlist ? (
                    <MaterialIcons 
                      name="favorite" 
                      size={16} 
                      color={colors.darkRed}
                    />
                  ) : (
                    <MaterialIcons 
                      name="favorite-border" 
                      size={16} 
                      color={colors.darkRed}
                    />
                  )}
                </TouchableOpacity>

                {/* Out of Stock Overlay */}
                {isProductOutOfStock && (
                  <View className="absolute inset-0 bg-black/30 justify-center items-center">
                    <Text className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
                      OUT OF STOCK
                    </Text>
                  </View>
                )}
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
                  <FontAwesome
                    name="star"
                    size={12}
                    color="#FFD700"
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
                      <FontAwesome name="shopping-cart" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* "In Cart" badge */}
              {isProductInCart && !isProductAddingToCart && (
                <View className="absolute left-2 bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
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

export default TrendingProducts;