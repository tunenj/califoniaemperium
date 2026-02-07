// components/category/SidebarMenu.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLanguage } from "@/context/LanguageContext";

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
}

const SidebarMenu = ({ 
  categories = [], 
  onCategorySelect = () => {}, 
  selectedCategory = null 
}: SidebarMenuProps) => {
  const { t } = useLanguage();

  // Filter categories to show only parent categories (where parent is null)
  const parentCategories = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    
    // First, find all parent categories (where parent is null)
    const parents = safeCategories.filter(cat => cat.parent === null);
    
    // For each parent, find its children from the flat list
    return parents.map(parent => {
      const children = safeCategories.filter(cat => cat.parent === parent.id);
      return {
        ...parent,
        children: children || []
      };
    }).sort((a, b) => a.order - b.order); // Sort by order
  }, [categories]);

  const handleCategoryPress = (category: Category) => {
    // If clicking the same category, deselect it (show all products)
    if (selectedCategory?.id === category.id) {
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  // Calculate total product count from children
  const getTotalProductCount = (category: Category): number => {
    let total = category.product_count || 0;
    if (category.children && Array.isArray(category.children) && category.children.length > 0) {
      category.children.forEach(child => {
        total += child.product_count || 0;
      });
    }
    return total;
  };

  // Safety check for categories
  const safeCategories = Array.isArray(parentCategories) ? parentCategories : [];

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
          onPress={() => onCategorySelect(null)}
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
        {safeCategories.length > 0 ? (
          safeCategories.map((category) => {
            const totalCount = getTotalProductCount(category);
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
                  
                  {/* Product count */}
                  {totalCount > 0 && (
                    <Text className="text-xs text-gray-500 mt-1">
                      {totalCount} {t('items') || 'items'}
                    </Text>
                  )}
                  
                  {/* Children count if any */}
                  {category.children && category.children.length > 0 && (
                    <Text className="text-xs text-gray-400 mt-0.5">
                      {category.children.length} {t('subcategories') || 'subcategories'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="py-8 px-4">
            <Text className="text-sm text-gray-500 text-center">
              {t('no_categories') || 'No categories available'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SidebarMenu;