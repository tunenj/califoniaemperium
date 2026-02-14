// components/category/ProductCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { colors } from "@/constants/color";

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  category_name: string;
  brand_name: string;
  price: string;
  compare_at_price: string | null;
  discount_percentage: number;
  main_image: string | null;
  is_in_stock: boolean;
  rating_average: string;
  rating_count: number;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onPress?: () => void;
  // Cart and wishlist props
  onAddToCart?: (event?: any) => void;
  onToggleWishlist?: (event?: any) => void;
  isInCart?: boolean;
  isInWishlist?: boolean;
  isAddingToCart?: boolean;
  isTogglingWishlist?: boolean;
  cartSyncing?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode, 
  onPress,
  onAddToCart,
  onToggleWishlist,
  isInCart = false,
  isInWishlist = false,
  isAddingToCart = false,
  isTogglingWishlist = false,
  cartSyncing = false,
}) => {
  const router = useRouter();

  const formatPrice = (priceValue: string) => {
    const numPrice = parseFloat(priceValue);
    return `₦${numPrice.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (product.slug) {
      router.push({
        pathname: "/(customer)/product/[slug]",
        params: { slug: product.slug, productName: product.name || 'Product' },
      });
    }
  };

  const handleCartPress = (e?: any) => {
    if (e) {
      e.stopPropagation();
    }
    if (onAddToCart) {
      onAddToCart(e);
    } else {
      console.log("Add to cart:", product.id);
    }
  };

  const handleWishlistPress = (e?: any) => {
    if (e) {
      e.stopPropagation();
    }
    if (onToggleWishlist) {
      onToggleWishlist(e);
    } else {
      console.log("Toggle wishlist:", product.id);
    }
  };

  const renderRating = () => {
    const rating = parseFloat(product.rating_average);
    if (rating <= 0) return null;

    return (
      <View className="flex-row items-center">
        <Text className="text-yellow-500 text-xs mr-1">★</Text>
        <Text className="text-xs text-gray-600">{rating.toFixed(1)} ({product.rating_count || 0})</Text>
      </View>
    );
  };

  // ---------- List View ----------
  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white rounded-lg mb-3 flex-row overflow-hidden border border-gray-200"
        activeOpacity={0.7}
      >
        <View className="relative">
          {product.main_image ? (
            <Image source={{ uri: product.main_image }} className="w-32 h-full" resizeMode="cover" />
          ) : (
            <View className="w-32 h-full bg-gray-100 items-center justify-center">
              <Text className="text-gray-400 text-xs">No Image</Text>
            </View>
          )}
          
          {product.discount_percentage > 0 && (
            <View className="absolute top-2 left-2 bg-darkRed px-2 py-0.5 rounded">
              <Text className="text-white text-xs font-bold">-{product.discount_percentage}%</Text>
            </View>
          )}

          {/* Wishlist Icon - Top Right of Image */}
          {onToggleWishlist && (
            <TouchableOpacity
              onPress={handleWishlistPress}
              disabled={isTogglingWishlist}
              className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md"
              style={{ opacity: isTogglingWishlist ? 0.6 : 1 }}
            >
              {isTogglingWishlist ? (
                <ActivityIndicator size="small" color={colors.darkRed} />
              ) : isInWishlist ? (
                <MaterialIcons 
                  name="favorite" 
                  size={14} 
                  color={colors.darkRed}
                />
              ) : (
                <MaterialIcons 
                  name="favorite-border" 
                  size={14} 
                  color={colors.darkRed}
                />
              )}
            </TouchableOpacity>
          )}

          {/* In Cart Badge */}
          {isInCart && !isAddingToCart && (
            <View className="absolute bottom-2 left-2 bg-green-100 px-2 py-0.5 rounded border border-green-300">
              <Text className="text-xs text-green-800 font-medium">In Cart</Text>
            </View>
          )}
        </View>

        <View className="flex-1 p-3 justify-between">
          <View>
            <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>
              {product.name}
            </Text>
            <Text className="text-xs text-gray-500 mb-1">{product.brand_name || 'Brand'}</Text>
            {renderRating()}
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-lg font-bold text-red-600">{formatPrice(product.price)}</Text>
              {product.compare_at_price && parseFloat(product.compare_at_price) > 0 && (
                <Text className="text-xs text-gray-400 line-through">{formatPrice(product.compare_at_price)}</Text>
              )}
            </View>

            {/* Cart Button */}
            {onAddToCart && (
              <TouchableOpacity
                onPress={handleCartPress}
                disabled={!product.is_in_stock || isAddingToCart || cartSyncing}
                className={`p-2 rounded-lg ${isInCart ? 'bg-green-600' : 'bg-darkRed'}`}
                style={{ 
                  opacity: !product.is_in_stock ? 0.5 : 1,
                  minWidth: 36,
                  minHeight: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isAddingToCart ? (
                  <ActivityIndicator size="small" color="white" />
                ) : isInCart ? (
                  <AntDesign name="check" size={16} color="white" />
                ) : (
                  <FontAwesome name="shopping-cart" size={16} color="white" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ---------- Grid View ----------
  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white rounded-lg overflow-hidden border border-gray-200 flex-1 mb-4"
      activeOpacity={0.7}
    >
      <View className="relative">
        {product.main_image ? (
          <Image source={{ uri: product.main_image }} className="w-full h-40" resizeMode="cover" />
        ) : (
          <View className="w-full h-40 bg-gray-100 items-center justify-center">
            <Text className="text-gray-400 text-xs">No Image</Text>
          </View>
        )}

        {product.discount_percentage > 0 && (
          <View className="absolute top-2 left-2 bg-darkRed px-2 py-1 rounded z-10">
            <Text className="text-white text-xs font-bold">-{product.discount_percentage}%</Text>
          </View>
        )}

        {/* Wishlist Icon - Top Right */}
        {onToggleWishlist && (
          <TouchableOpacity
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md z-20"
            onPress={handleWishlistPress}
            disabled={isTogglingWishlist}
            style={{
              opacity: isTogglingWishlist ? 0.6 : 1,
            }}
          >
            {isTogglingWishlist ? (
              <ActivityIndicator size="small" color={colors.darkRed} />
            ) : isInWishlist ? (
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
        )}

        {!product.is_in_stock && (
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-1">
            <Text className="text-white text-xs text-center font-medium">Out of Stock</Text>
          </View>
        )}

        {/* In Cart Badge */}
        {isInCart && !isAddingToCart && product.is_in_stock && (
          <View className="absolute bottom-2 left-2 bg-green-100 px-2 py-0.5 rounded border border-green-300 z-10">
            <Text className="text-xs text-green-800 font-medium">In Cart</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-xs text-gray-500 mb-1">{product.brand_name || 'Brand'}</Text>
        <Text className="text-sm font-semibold text-gray-900 mb-2" numberOfLines={2}>
          {product.name}
        </Text>

        {renderRating()}

        <View className="flex-row items-center justify-between mt-2">
          <View>
            <Text className="text-lg font-bold text-darkRed">{formatPrice(product.price)}</Text>
            {product.compare_at_price && parseFloat(product.compare_at_price) > 0 && (
              <Text className="text-xs text-gray-400 line-through">{formatPrice(product.compare_at_price)}</Text>
            )}
          </View>

          {/* Cart Button */}
          {onAddToCart && (
            <TouchableOpacity
              className={`p-2 rounded-lg ${isInCart ? 'bg-green-600' : 'bg-darkRed'}`}
              onPress={handleCartPress}
              disabled={!product.is_in_stock || isAddingToCart || cartSyncing}
              style={{
                opacity: !product.is_in_stock ? 0.5 : 1,
                minWidth: 32,
                minHeight: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="white" />
              ) : isInCart ? (
                <AntDesign name="check" size={16} color="white" />
              ) : (
                <FontAwesome name="shopping-cart" size={16} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;