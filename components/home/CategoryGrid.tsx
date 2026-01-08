import React from 'react';
import { View, Text, Image } from 'react-native';
import images from '@/constants/images';

const categories = [
  { id: 1, label: 'Women', icon: images.women },
  { id: 2, label: 'Men', icon: images.men },
  { id: 3, label: 'Kids', icon: images.kids },
  { id: 4, label: 'Dresses', icon: images.dress },
  { id: 5, label: 'Jewelry', icon: images.jewelry },
  { id: 6, label: 'Shoes', icon: images.shoes },
  { id: 7, label: 'Tops', icon: images.tops },
  { id: 8, label: 'Underwear', icon: images.underwear },
  { id: 9, label: 'Baby wears', icon: images.baby },
  { id: 10, label: 'Bags', icon: images.bags },
  { id: 11, label: 'Electronics', icon: images.electronics },
  { id: 12, label: 'Beauty', icon: images.beauty },
  { id: 13, label: 'Fashion', icon: images.fashion },
  { id: 14, label: 'Watches', icon: images.watches },
  { id: 15, label: 'Gadgets', icon: images.gadget },
];

const CategoryGrid = () => {
  return (
    <View className="mt-6 px-4 bg-white p-4 rounded-2xl mx-2">
      <View className="flex-row flex-wrap justify-between">
        {categories.map(item => (
          <View
            key={item.id}
            className="w-[18%] items-center mb-4"
          >
            <View className="w-14 h-14 rounded-full bg-white items-center justify-center shadow">
              <Image
                source={item.icon}
                className="w-14 h-14"
                resizeMode="contain"
              />
            </View>
            <Text className="text-xs mt-1 text-center">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryGrid;
