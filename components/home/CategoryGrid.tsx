import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import images from '@/constants/images';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'expo-router';
import { useExploreSearch } from '@/context/ExploreSearchContext';

const CategoryGrid = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { setSearchQuery } = useExploreSearch();

  const categories = [
    { 
      id: 1, 
      label: 'Women', 
      translationKey: 'women', 
      icon: images.women,
      categoryName: "Women's Clothing"
    },
    { 
      id: 2, 
      label: 'Men', 
      translationKey: 'men', 
      icon: images.men,
      categoryName: "Men's Clothing"
    },
    { 
      id: 3, 
      label: 'Kids', 
      translationKey: 'kids', 
      icon: images.kids,
      categoryName: "Kids"
    },
    { 
      id: 4, 
      label: 'Dresses', 
      translationKey: 'dresses', 
      icon: images.dress,
      categoryName: "Dresses"
    },
    { 
      id: 5, 
      label: 'Jewelry', 
      translationKey: 'jewelry', 
      icon: images.jewelry,
      categoryName: "Jewelry"
    },
    { 
      id: 6, 
      label: 'Shoes', 
      translationKey: 'shoes', 
      icon: images.shoes,
      categoryName: "Shoes"
    },
    { 
      id: 7, 
      label: 'Tops', 
      translationKey: 'tops', 
      icon: images.tops,
      categoryName: "Tops"
    },
    { 
      id: 8, 
      label: 'Underwear', 
      translationKey: 'underwear', 
      icon: images.underwear,
      categoryName: "Underwear"
    },
    { 
      id: 9, 
      label: 'Baby wears', 
      translationKey: 'baby_wears', 
      icon: images.baby,
      categoryName: "Baby"
    },
    { 
      id: 10, 
      label: 'Bags', 
      translationKey: 'bags', 
      icon: images.bags,
      categoryName: "Bags"
    },
    { 
      id: 11, 
      label: 'Electronics', 
      translationKey: 'electronics', 
      icon: images.electronics,
      categoryName: "Electronics"
    },
    { 
      id: 12, 
      label: 'Beauty', 
      translationKey: 'beauty', 
      icon: images.beauty,
      categoryName: "Beauty"
    },
    { 
      id: 13, 
      label: 'Fashion', 
      translationKey: 'fashion', 
      icon: images.fashion,
      categoryName: "Fashion"
    },
    { 
      id: 14, 
      label: 'Watches', 
      translationKey: 'watches', 
      icon: images.watches,
      categoryName: "Watches"
    },
    { 
      id: 15, 
      label: 'Gadgets', 
      translationKey: 'gadgets', 
      icon: images.gadget,
      categoryName: "Gadgets"
    },
  ];

  const handleCategoryPress = (item: typeof categories[0]) => {
    setSearchQuery(item.categoryName);
    router.push('/(customer)/explore');
  };

  return (
    <View className="mt-6 px-4 bg-white p-4 rounded-2xl mx-2">
      <View className="flex-row flex-wrap justify-between">
        {categories.map(item => (
          <TouchableOpacity
            key={item.id}
            className="w-[18%] items-center mb-4"
            onPress={() => handleCategoryPress(item)}
            activeOpacity={0.7}
          >
            <View className="w-14 h-14 rounded-full bg-white items-center justify-center shadow">
              <Image
                source={item.icon}
                className="w-14 h-14"
                resizeMode="contain"
              />
            </View>
            <Text className="text-xs mt-1 text-center">
              {t(item.translationKey) || item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CategoryGrid;