// components/common/ProductCard.tsx - Updated with safe checks
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Heart, ShoppingCart, Star } from "lucide-react-native";
import { useLanguage } from "@/context/LanguageContext";
import { router } from "expo-router";

interface Product {
  id: string;
  name?: string;
  slug?: string;
  price?: string;
  compare_at_price?: string | null;
  discount_percentage?: number;
  rating_average?: string;
  rating_count?: number;
  stock_quantity?: number;
  is_in_stock?: boolean;
  images?: any[];
  variants?: any[];
  category?: {
    name?: string;
  };
  vendor_info?: {
    vendor_name?: string;
  };
}

interface Props {
  product?: Product | null;
  imageSource?: any;
}

const ProductCard: React.FC<Props> = ({ product, imageSource }) => {
  const { t } = useLanguage();

  // If no product, render placeholder or null
  if (!product) {
    return (
      <View className="bg-white w-[48%] rounded-xl mb-4 shadow overflow-hidden">
        <View className="w-full h-40 bg-gray-200" />
        <View className="p-3">
          <View className="h-4 bg-gray-300 rounded mb-2" />
          <View className="h-3 bg-gray-300 rounded w-2/3" />
        </View>
      </View>
    );
  }

  // Format price with safe checks
  const formatPrice = (price: string | undefined | null) => {
    if (!price) return "₦0";
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "₦0";
    
    return `₦${numPrice.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  // Calculate discount with safe checks
  const calculateDiscount = () => {
    if (!product?.price || !product?.compare_at_price) return 0;
    
    const currentPrice = parseFloat(product.price);
    const originalPrice = parseFloat(product.compare_at_price);
    
    if (isNaN(currentPrice) || isNaN(originalPrice) || originalPrice <= 0) return 0;
    
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  const discount = calculateDiscount();
  const hasDiscount = discount > 0;
  const isInStock = product.is_in_stock || false;
  const stockQuantity = product.stock_quantity || 0;
  const rating = product.rating_average ? parseFloat(product.rating_average).toFixed(1) : "0.0";
  const ratingCount = product.rating_count || 0;

  // Get product image with safe checks
  const getProductImage = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return { uri: product.images[0] };
    }
    
    if (product.variants && Array.isArray(product.variants)) {
      const variantWithImage = product.variants.find(v => v?.image || v?.image_url);
      if (variantWithImage?.image) return { uri: variantWithImage.image };
      if (variantWithImage?.image_url) return { uri: variantWithImage.image_url };
    }
    
    return imageSource || null;
  };

  const productImage = getProductImage();

  return (
    <TouchableOpacity
      className="bg-white w-[48%] rounded-xl mb-4 shadow overflow-hidden"
      onPress={() => {
        if (product.slug) {
          router.push({
            pathname: "/(customer)/product/[slug]",
            params: { slug: product.slug }
          });
        }
      }}
      activeOpacity={0.9}
      disabled={!product.slug}
    >
      {/* Product Image */}
      <View className="relative">
        <View className="w-full h-40 bg-gray-100 items-center justify-center">
          {productImage ? (
            <Image 
              source={productImage} 
              className="w-full h-full" 
              resizeMode="cover" 
            />
          ) : (
            <View className="w-20 h-20 bg-gray-300 rounded-lg" />
          )}
        </View>

        {/* Discount Badge */}
        {hasDiscount && (
          <View className="absolute left-2 top-2 bg-darkRed rounded-full px-2 py-1">
            <Text className="text-white text-xs font-bold">
              -{discount}%
            </Text>
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity
          className="absolute right-2 top-2 bg-white/90 p-1.5 rounded-full"
          onPress={() => console.log("Add to wishlist:", product.id)}
        >
          <Heart size={16} color="#666" />
        </TouchableOpacity>

        {/* Stock Status Overlay */}
        {!isInStock && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <Text className="text-white font-semibold">
              {t('out_of_stock') || 'Out of stock'}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Product Name */}
        <Text 
          className="font-semibold text-sm mt-1" 
          numberOfLines={2}
          style={{ minHeight: 40 }}
        >
          {product.name || t('unnamed_product') || 'Product'}
        </Text>

        {/* Rating */}
        <View className="flex-row items-center mt-1">
          <View className="flex-row items-center">
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text className="text-xs font-semibold ml-1">
              {rating}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs ml-1">
            ({ratingCount})
          </Text>
        </View>

        {/* Price */}
        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-1">
            <Text className="text-darkRed font-bold text-base">
              {formatPrice(product.price)}
            </Text>
            {hasDiscount && product.compare_at_price && (
              <Text className="text-xs text-gray-400 line-through">
                {formatPrice(product.compare_at_price)}
              </Text>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            className="p-2 bg-gray-100 rounded-lg"
            onPress={() => console.log("Add to cart:", product.id)}
            disabled={!isInStock}
          >
            <ShoppingCart size={18} color={isInStock ? "#666" : "#ccc"} />
          </TouchableOpacity>
        </View>

        {/* Stock Info */}
        {isInStock && stockQuantity > 0 && (
          <Text className="text-xs text-green-600 mt-1">
            {t('in_stock') || 'In stock'} ({stockQuantity})
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;