import React from 'react';
import { View, Text, Image } from 'react-native';
import images from '@/constants/images';
import { useLanguage } from '@/context/LanguageContext'; // Add this import

// Move categories inside component to use translation hook
const CategoryGrid = () => {
  const { t } = useLanguage(); // Add this hook

  const categories = [
    { id: 1, label: 'Women', translationKey: 'women', icon: images.women },
    { id: 2, label: 'Men', translationKey: 'men', icon: images.men },
    { id: 3, label: 'Kids', translationKey: 'kids', icon: images.kids },
    { id: 4, label: 'Dresses', translationKey: 'dresses', icon: images.dress },
    { id: 5, label: 'Jewelry', translationKey: 'jewelry', icon: images.jewelry },
    { id: 6, label: 'Shoes', translationKey: 'shoes', icon: images.shoes },
    { id: 7, label: 'Tops', translationKey: 'tops', icon: images.tops },
    { id: 8, label: 'Underwear', translationKey: 'underwear', icon: images.underwear },
    { id: 9, label: 'Baby wears', translationKey: 'baby_wears', icon: images.baby },
    { id: 10, label: 'Bags', translationKey: 'bags', icon: images.bags },
    { id: 11, label: 'Electronics', translationKey: 'electronics', icon: images.electronics },
    { id: 12, label: 'Beauty', translationKey: 'beauty', icon: images.beauty },
    { id: 13, label: 'Fashion', translationKey: 'fashion', icon: images.fashion },
    { id: 14, label: 'Watches', translationKey: 'watches', icon: images.watches },
    { id: 15, label: 'Gadgets', translationKey: 'gadgets', icon: images.gadget },
  ];

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
              {t(item.translationKey) || item.label} {/* Use translation */}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryGrid;