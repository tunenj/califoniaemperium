// components/category/SidebarMenu.tsx
import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter, usePathname } from "expo-router";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  icon: string;
  parent: string | null;
  children: Category[];
  full_path: string;
  order: number;
  is_active: boolean;
  product_count: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

interface SidebarMenuProps {
  categories?: Category[];
  onCategorySelect?: (category: Category | null) => void;
  selectedCategory?: Category | null;
  isLoading?: boolean;
}

const SidebarMenu = ({ 
  categories = [], 
  onCategorySelect = () => {}, 
  selectedCategory = null,
  isLoading = false
}: SidebarMenuProps) => {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // Set ready state after mount
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Filter categories to show only parent categories (where parent is null)
  const parentCategories = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    // First, find all parent categories (where parent is null)
    const parents = categories.filter(cat => cat.parent === null);
    
    // For each parent, find its children from the flat list
    return parents.map(parent => {
      const children = categories.filter(cat => cat.parent === parent.id);
      return {
        ...parent,
        children: children || []
      };
    }).sort((a, b) => a.order - b.order); // Sort by order
  }, [categories]);

  const handleCategoryPress = (category: Category) => {
    // Call the callback first
    onCategorySelect(category);
    
    // Check if we're already on the category screen
    if (pathname === '/(customer)/category') {
      // If we're on the category screen, just update the selected category
      console.log('📍 Category selected:', category.name, 'Slug:', category.slug);
    } else {
      // If we're on a different screen, navigate to category screen with params
      router.push({
        pathname: "/(customer)/category",
        params: { 
          category: category.slug,
          categoryName: category.name
        }
      });
    }
  };

  const handleAllProductsPress = () => {
    onCategorySelect(null);
    
    if (pathname === '/(customer)/category') {
      // Already on category screen, just clear selection
      console.log('📍 Showing all products');
    } else {
      // Navigate to category screen without category param
      router.push("/(customer)/category");
    }
  };

  // Show loading state if not ready or loading
  if (!isReady || isLoading) {
    return (
      <View className="w-[110px] bg-white">
        <View className="px-3 py-4 border-b border-gray-200 bg-pink-50">
          <Text className="text-base text-gray-900 border-l-8 border-red-800 pl-3 pt-3 h-20">
            {t('categories') || 'Categories'}
          </Text>
        </View>
        <View className="h-[400px] items-center justify-center border-r border-gray-200">
          <ActivityIndicator size="small" color="#C62828" />
          <Text className="text-xs text-gray-500 mt-2">
            {t('loading_categories') || 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="w-[110px] bg-white">
      <View className="px-3 py-4 border-b border-gray-200 bg-pink-50">
        <Text className="text-base text-gray-900 border-l-8 border-red-800 pl-3 pt-3 h-20">
          {t('categories') || 'Categories'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="max-h-[400px] border-r border-gray-200 bg-white rounded-xl"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* All Products Option */}
        <TouchableOpacity
          className={`w-full py-3 px-4 border-b border-gray-100 active:opacity-70 ${
            !selectedCategory ? 'bg-red-50 border-l-6 border-l-red-600' : ''
          }`}
          activeOpacity={0.7}
          onPress={handleAllProductsPress}
        >
          <View>
            <Text className={`text-sm ${
              !selectedCategory ? 'text-red-600 font-semibold' : 'text-gray-900'
            }`}>
              {t('all_products') || 'All Products'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Parent Categories */}
        {parentCategories.length > 0 ? (
          parentCategories.map((category) => {
            const isSelected = selectedCategory?.id === category.id;
            
            return (
              <TouchableOpacity
                key={category.id}
                className={`w-full py-3 px-4 border-b border-gray-100 active:opacity-70 ${
                  isSelected ? 'bg-red-50 border-l-6 border-l-red-600' : ''
                }`}
                activeOpacity={0.7}
                onPress={() => handleCategoryPress(category)}
              >
                <View>
                  <Text 
                    className={`text-xs font-medium ${
                      isSelected ? 'text-red-600 font-semibold' : 'text-gray-900'
                    }`}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="py-8 px-4">
            <Text className="text-sm text-gray-500 text-center">
              {t('loading_categories') || 'Loading categories...'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SidebarMenu;