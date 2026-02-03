import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductDetailProps = {
  image: any;
  denimImage: any;
  shoesImage: any;
  shoesImage2: any;
};

const ProductDetailScreen: React.FC<ProductDetailProps> = ({
  image,
  denimImage,
  shoesImage,
  shoesImage2,
}) => {
  const [selectedColor, setSelectedColor] = useState<'blue' | 'black'>('blue');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Added to cart:', { selectedColor, quantity });
  };

  return (
    <ScrollView 
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Main Product Image */}
      <Image 
        source={require('../assets/images/vase.png')} 
        className="w-full h-96" 
        resizeMode="cover"
      />

      {/* Product Title & Actions */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              Denim Jacket Color
            </Text>
            <Text className="text-sm text-gray-600 mb-3 leading-relaxed">
              2 pieces of silk sleeveless shirts, with collar
            </Text>
          </View>
          
          {/* Favorite & Cart Buttons */}
          <View className="flex-col space-y-2 ml-2">
            <TouchableOpacity className="w-10 h-10 bg-red-50 rounded-full items-center justify-center">
              <Ionicons name="heart-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-10 h-10 bg-red-500 rounded-full items-center justify-center"
              onPress={handleAddToCart}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price & Rating */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-gray-900">₦25,000</Text>
            <Text className="text-sm text-gray-400 line-through ml-2">₦35,000</Text>
          </View>
          <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="text-xs text-yellow-800 ml-1 font-medium">4.5</Text>
          </View>
        </View>
      </View>

      {/* Color Selector */}
      <View className="px-4 mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-3">Color</Text>
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity
            className={`w-12 h-12 rounded-full border-4 ${
              selectedColor === 'blue' 
                ? 'border-blue-500 bg-blue-500 shadow-lg' 
                : 'border-gray-300 bg-blue-400'
            }`}
            onPress={() => setSelectedColor('blue')}
          />
          <TouchableOpacity
            className={`w-12 h-12 rounded-full border-4 ${
              selectedColor === 'black'
                ? 'border-gray-900 bg-gray-900 shadow-lg'
                : 'border-gray-300 bg-gray-800'
            }`}
            onPress={() => setSelectedColor('black')}
          />
        </View>
      </View>

      {/* Size Selector */}
      <View className="px-4 mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-3">Size</Text>
        <View className="flex-row space-x-2">
          {['S', 'M', 'L', 'XL'].map((size) => (
            <TouchableOpacity
              key={size}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white"
              onPress={() => console.log('Size selected:', size)}
            >
              <Text className="text-sm font-medium text-gray-700">{size}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Authenticity Badge */}
      <TouchableOpacity className="mx-4 mb-4 bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl items-center">
        <Text className="text-white font-semibold text-base">
          Authenticity Guaranteed ✓
        </Text>
        <Text className="text-white/90 text-sm mt-1">100% Original</Text>
      </TouchableOpacity>

      {/* Policies */}
      <View className="px-4 mb-6 space-y-3">
        <TouchableOpacity className="flex-row items-center py-3">
          <View className="w-2 h-2 bg-red-500 rounded-full mr-3" />
          <Text className="flex-1 text-sm text-gray-700">
            Free returns within 7 days
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center py-3">
          <View className="w-2 h-2 bg-red-500 rounded-full mr-3" />
          <Text className="flex-1 text-sm text-gray-700">
            Delivery Nationwide
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Related Products */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-4">Related Products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-4">
            {/* Related Product 1 */}
            <TouchableOpacity className="w-32 bg-gray-50 rounded-2xl p-3 items-center">
              <Image 
                source={require('../assets/images/underwear.png')} 
                className="w-20 h-20 rounded-xl mb-2" 
                resizeMode="cover"
              />
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                Denim Shoes Max
              </Text>
              <Text className="text-xs text-gray-500 mb-2">₦15,000</Text>
              <View className="flex-row bg-yellow-100 px-2 py-1 rounded-full">
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text className="text-xs text-yellow-800 ml-1 font-medium">4.8</Text>
              </View>
            </TouchableOpacity>

            {/* Related Product 2 */}
            <TouchableOpacity className="w-32 bg-gray-50 rounded-2xl p-3 items-center">
              <Image 
                source={shoesImage} 
                className="w-20 h-20 rounded-xl mb-2" 
                resizeMode="cover"
              />
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                Running Pro
              </Text>
              <Text className="text-xs text-gray-500 mb-2">₦18,000</Text>
              <View className="flex-row bg-yellow-100 px-2 py-1 rounded-full">
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text className="text-xs text-yellow-800 ml-1 font-medium">4.7</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Invisible bottom spacer */}
      <View className="h-24" />
    </ScrollView>
  );
};

export default ProductDetailScreen;
