import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Heart, ShoppingCart } from "lucide-react-native";

interface Props {
  item: any;
}

const ProductCard: React.FC<Props> = ({ item }) => {
  return (
    <View className="bg-white w-[48%] rounded-xl mb-4 shadow overflow-hidden">
      {/* Product Image */}
      <View>
        <Image source={item.image} className="w-full h-32" resizeMode="cover" />

        {/* Discount Badge */}
        <View className="absolute left-2 top-2 bg-red-500 rounded-full px-2 py-[1px]">
          <Text className="text-white text-xs font-semibold">
            {item.discount || "50%"}
          </Text>
        </View>

        {/* Wishlist Icon */}
        <TouchableOpacity className="absolute right-2 top-2">
          <Heart size={18} color="black" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Title */}
        <Text className="font-semibold text-sm mt-1" numberOfLines={1}>
          {item.title}
        </Text>

        {/* Rating */}
        <View className="flex-row items-center mt-1">
          <Text className="text-yellow-500 text-xs">★★★★☆</Text>
          <Text className="text-gray-500 text-xs ml-1">(234)</Text>
        </View>

        {/* Price + Old Price + Cart */}
        <View className="flex-row justify-between items-end mt-2">
          <View className="flex-row items-center space-x-2 gap-2">
            <Text className="text-red-600 font-semibold">{item.price}</Text>
            <Text className="text-xs text-gray-400 line-through">
              {item.oldPrice || "₦109,000"}
            </Text>
          </View>

          <TouchableOpacity>
            <ShoppingCart size={18} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;
