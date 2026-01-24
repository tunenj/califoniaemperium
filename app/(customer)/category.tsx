import React from "react";
import { ScrollView, View, Text } from "react-native";
import CategorySection from "@/components/category/CategorySection";
import SidebarMenu from "@/components/category/SidebarMenu";
import Dashboard from "@/components/explore/dashboard";
import { useLanguage } from '@/context/LanguageContext'; // Add import

const CategoryScreen = () => {
  const { t } = useLanguage(); // Add hook

  return (
    <View className="flex-1 bg-lightPink">
      <Dashboard />
      <View className="flex-row flex-1">
        {/* LEFT SIDEBAR */}
        <SidebarMenu />

        {/* RIGHT CONTENT */}
        <View className="flex-1">
          {/* Fixed "All products" Header */}
          <View className="px-4 py-4 bg-white z-10 mt-2 ml-1 rounded-2xl">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-800">
                {t('all_products')}
              </Text>
              <Text className="text-sm text-red-500 font-medium">›</Text>
            </View>
          </View>

          {/* Scrollable Content UNDER Header */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 -mt-4"
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 5 }}
          >
            {/* Each section wrapped in its own background */}
            <View className="bg-white rounded-xl p-6 mb-2 w-[250px] -mx-6">
              <CategorySection
                title={t('appliances')}
                items={[
                  { label: t('small_appliances'), image: require("../../assets/images/blender.png") },
                  { label: t('big_appliances'), image: require("../../assets/images/fridge.png") },
                ]}
              />
            </View>

            <View className="bg-white rounded-xl p-6 mb-2 w-[250px] -mx-6">
              <CategorySection
                title={t('home_kitchen')}
                items={[
                  { label: t('cookware'), image: require("../../assets/images/Cookware.png") },
                  { label: t('bakeware'), image: require("../../assets/images/Bakeware.png") },
                  { label: t('cutlery'), image: require("../../assets/images/Cutlery.png") },
                  { label: t('small_cooker'), image: require("../../assets/images/Cooker.png") },
                ]}
              />
            </View>

            <View className="bg-white rounded-xl p-6 mb-2 w-[250px] -mx-6">
              <CategorySection
                title={t('home')}
                items={[
                  { label: t('bedding'), image: require("../../assets/images/Bedding.png") },
                  { label: t('decor'), image: require("../../assets/images/Decor.png") },
                  { label: t('lighting'), image: require("../../assets/images/Lighting.png") },
                  { label: t('bathroom'), image: require("../../assets/images/Bathroom.png") },
                  { label: t('lamp'), image: require("../../assets/images/Lamp.png") },
                  { label: t('cleaner'), image: require("../../assets/images/BathroomCleaner.png") },
                ]}
              />
            </View>

            <View className="bg-white rounded-xl p-6 mb-6 w-[250px] -mx-6">
              <CategorySection
                title={t('office_products')}
                items={[
                  { label: t('chair'), image: require("../../assets/images/Chair.png") },
                  { label: t('table'), image: require("../../assets/images/Table.png") },
                  { label: t('stationary'), image: require("../../assets/images/Stationary.png") },
                ]}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default CategoryScreen;