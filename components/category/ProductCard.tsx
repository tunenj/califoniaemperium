// components/category/ProductCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
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
  onAddToCart?: (event?: any) => void;
  onToggleWishlist?: (event?: any) => void;
  isInCart?: boolean;
  isInWishlist?: boolean;
  isAddingToCart?: boolean;
  isTogglingWishlist?: boolean;
  cartSyncing?: boolean;
}

const formatPrice = (price: string) => {
  const n = parseFloat(price);
  return isNaN(n) ? '€0.00' : `€${n.toFixed(2)}`;
};

// ─── Product Image with loading/error states ──────────────────────────────────
const ProductImage = ({ uri }: { uri: string | null }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View className="w-full h-full items-center justify-center bg-gray-100">
        <Text className="text-gray-400 text-xs">No image</Text>
      </View>
    );
  }

  return (
    <>
      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-gray-100 z-10">
          <ActivityIndicator size="small" color="#DC2626" />
        </View>
      )}
      <Image
        source={{ uri, cache: 'force-cache' }}
        className="w-full h-full"
        resizeMode="contain" // ✅ matches explore.tsx — was "cover" before
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
      />
    </>
  );
};

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

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (product.slug) {
      router.push({
        pathname: '/(customer)/product/[slug]',
        params: { slug: product.slug, productName: product.name || 'Product' },
      });
    }
  };

  const handleCartPress = (e?: any) => {
    e?.stopPropagation();
    if (onAddToCart) onAddToCart(e);
  };

  const handleWishlistPress = (e?: any) => {
    e?.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(e);
  };

  const discountPct = product.compare_at_price
    ? Math.max(0, Math.round(
      ((parseFloat(product.compare_at_price) - parseFloat(product.price)) /
        parseFloat(product.compare_at_price)) * 100
    ))
    : product.discount_percentage || 0;

  const rating = parseFloat(product.rating_average);

  const CartButton = () => (
    <TouchableOpacity
      onPress={handleCartPress}
      disabled={!product.is_in_stock || isAddingToCart || cartSyncing}
      className={`p-2 rounded-lg ${isInCart ? 'bg-green-600' : 'bg-darkRed'}`}
      style={{
        opacity: !product.is_in_stock ? 0.5 : 1,
        width: 36,
        height: 36,
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
  );

  const WishlistButton = ({ style }: { style?: any }) => (
    <TouchableOpacity
      onPress={handleWishlistPress}
      disabled={isTogglingWishlist}
      className="bg-white rounded-full shadow-md"
      style={[
        { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      {isTogglingWishlist ? (
        <ActivityIndicator size="small" color={colors.darkRed} />
      ) : (
        <AntDesign
          name="heart"
          size={16}
          color={isInWishlist ? colors.darkRed : '#6B7280'}
        />
      )}
    </TouchableOpacity>
  );

  // ── List View ──────────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white rounded-xl mb-3 flex-row overflow-hidden border border-gray-200 shadow-sm"
        activeOpacity={0.8}
      >
        {/* Image */}
        <View className="w-32 h-32 relative bg-gray-100 overflow-hidden">
          <ProductImage uri={product.main_image} />
          {discountPct > 0 && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded-full z-10">
              <Text className="text-white text-xs font-bold">-{discountPct}%</Text>
            </View>
          )}
          {isInCart && !isAddingToCart && (
            <View className="absolute bottom-2 left-2 bg-green-100 px-2 py-0.5 rounded border border-green-300 z-10">
              <Text className="text-xs text-green-800 font-medium">In Cart</Text>
            </View>
          )}
          {onToggleWishlist && (
            <View className="absolute top-2 right-2 z-20">
              <WishlistButton />
            </View>
          )}
        </View>

        {/* Details */}
        <View className="flex-1 p-3 justify-between">
          <View>
            <Text className="text-xs text-gray-500 mb-0.5">{product.brand_name || 'Brand'}</Text>
            <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>
              {product.name}
            </Text>
            {rating > 0 && (
              <View className="flex-row items-center">
                <Text className="text-yellow-500 text-xs mr-1">★</Text>
                <Text className="text-xs text-gray-600">
                  {rating.toFixed(1)} ({product.rating_count || 0})
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-lg font-bold text-red-600">{formatPrice(product.price)}</Text>
              {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) && (
                <Text className="text-xs text-gray-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </Text>
              )}
            </View>
            {onAddToCart && <CartButton />}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Grid View ──────────────────────────────────────────────────────────────
  // ✅ No flex-1 here — width is controlled by the parent FlatList column layout
  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm"
      activeOpacity={0.8}
    >
      {/* Image area */}
      <View className="w-full h-40 bg-gray-100 relative overflow-hidden">
        <ProductImage uri={product.main_image} />

        {/* Discount badge */}
        {discountPct > 0 && (
          <View className="absolute top-2 left-2 z-30 bg-red-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">-{discountPct}%</Text>
          </View>
        )}

        {/* In cart badge */}
        {isInCart && !isAddingToCart && product.is_in_stock && (
          <View
            className={`absolute z-30 bg-green-100 px-2 py-1 rounded-full border border-green-300 ${discountPct > 0 ? 'top-12 left-2' : 'top-2 left-2'
              }`}
          >
            <Text className="text-xs text-green-800 font-medium">In Cart</Text>
          </View>
        )}

        {/* Out of stock overlay */}
        {!product.is_in_stock && (
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 z-20">
            <Text className="text-white text-xs text-center font-medium">Out of Stock</Text>
          </View>
        )}

        {/* Wishlist button */}
        {onToggleWishlist && (
          <View className="absolute top-2 right-2 z-20">
            <WishlistButton />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="text-xs text-gray-500 mb-0.5">{product.brand_name || 'Brand'}</Text>
        <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        {rating > 0 && (
          <View className="flex-row items-center mb-2">
            <View className="flex-row items-center bg-yellow-50 px-2 py-0.5 rounded">
              <Text className="text-yellow-500 mr-1">★</Text>
              <Text className="text-xs font-semibold text-yellow-700">{rating.toFixed(1)}</Text>
            </View>
            <Text className="text-xs text-gray-400 ml-1">({product.rating_count || 0})</Text>
          </View>
        )}

        {/* Price + cart */}
        <View className="flex-row items-center justify-between mt-1">
          <View>
            <Text className="text-base font-bold text-darkRed">{formatPrice(product.price)}</Text>
            {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) && (
              <Text className="text-xs text-gray-400 line-through">
                {formatPrice(product.compare_at_price)}
              </Text>
            )}
          </View>
          {onAddToCart && <CartButton />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;