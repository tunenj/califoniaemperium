import React from "react";
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
}

interface SidebarMenuProps {
  categories?: Category[]; // Make optional
  onCategorySelect?: (category: Category | null) => void; // Make optional
  selectedCategory?: Category | null; // Make optional
}

const SidebarMenu = ({ 
  categories = [], 
  onCategorySelect = () => {}, 
  selectedCategory = null 
}: SidebarMenuProps) => {
  const { t } = useLanguage();

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
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <View>
      <View
        className="px-3 py-4 border-b border-gray-200 bg-lightPink"
        style={{ width: 140 }}
      >
        <Text className="text-lg text-gray-900 border-l-8 h-20 border-darkRed pl-3 pt-3">
          {t('categories') || 'Categories'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="max-h-[400px] border-r border-gray-200 bg-white rounded-xl"
        style={{ width: 140 }}
      >
        {/* All Products Option */}
        <TouchableOpacity
          className={`py-3 px-4 border-b border-gray-100 ${
            !selectedCategory ? 'bg-darkRed/10 border-l-6 border-l-darkRed' : ''
          }`}
          activeOpacity={0.7}
          onPress={() => onCategorySelect(null)}
        >
          <View>
            <Text className={`text-sm ${!selectedCategory ? 'text-darkRed font-semibold' : 'text-gray-900'}`}>
              {t('all_products') || 'All Products'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Categories from API */}
        {safeCategories.length > 0 ? (
          safeCategories.map((category) => {
            const totalCount = getTotalProductCount(category);
            const isSelected = selectedCategory?.id === category.id;
            
            return (
              <TouchableOpacity
                key={category.id}
                className={`py-3 px-4 border-b border-gray-100 ${
                  isSelected ? 'bg-darkRed/10 border-l-6 border-l-darkRed' : ''
                }`}
                activeOpacity={0.7}
                onPress={() => handleCategoryPress(category)}
              >
                <View>
                  <Text className={`text-sm ${
                    isSelected ? 'text-red-600 font-semibold' : 'text-gray-900'
                  }`}>
                    {category.name}
                  </Text>
                  {totalCount > 0 && (
                    <Text className="text-xs text-gray-500 mt-1">
                      {totalCount} {t('items') || 'items'}
                    </Text>
                  )}
                  {/* Show children count if any */}
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
            <Text className="text-gray-500 text-sm text-center">
              {t('no_categories') || 'No categories available'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SidebarMenu;