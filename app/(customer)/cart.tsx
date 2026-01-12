import React from "react";
import { ScrollView, View, Text } from "react-native";
import CategorySection from "@/components/category/CategorySection";
import SidebarMenu from "@/components/category/SidebarMenu";
import Dashboard from "@/components/explore/dashboard";

const CategoryScreen = () => {
  return (
    <View className="flex-1 bg-lightPink">
      <Dashboard />
      <View className="flex-row flex-1">

        {/* RIGHT CONTENT */}
        <View className="flex-1">
          {/* Fixed "All products" Header */}
          <View className="px-4 py-4 bg-white z-10 mt-2 ml-1 rounded-2xl">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-800">
                All products
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
                title="Appliances"
                items={[
                  { label: "Small Appliances", image: require("../../assets/images/blender.png") },
                  { label: "Big Appliances", image: require("../../assets/images/fridge.png") },
                ]}
              />
            </View>

            <View className="bg-white rounded-xl p-6 mb-2 w-[250px] -mx-6">
              <CategorySection
                title="Home & Kitchen"
                items={[
                  { label: "Cookware", image: require("../../assets/images/Cookware.png") },
                  { label: "Bakeware", image: require("../../assets/images/Bakeware.png") },
                  { label: "Cutlery", image: require("../../assets/images/Cutlery.png") },
                  { label: "Small cooker", image: require("../../assets/images/Cooker.png") },
                ]}
              />
            </View>

            <View className="bg-white rounded-xl p-6 mb-2 w-[250px] -mx-6">
              <CategorySection
                title="Home"
                items={[
                  { label: "Bedding", image: require("../../assets/images/Bedding.png") },
                  { label: "Decor", image: require("../../assets/images/Decor.png") },
                  { label: "Lighting", image: require("../../assets/images/Lighting.png") },
                  { label: "Bathroom", image: require("../../assets/images/Bathroom.png") },
                  { label: "Lamp", image: require("../../assets/images/Lamp.png") },
                  { label: "Cleaner", image: require("../../assets/images/BathroomCleaner.png") },
                ]}
              />
            </View>

            <View className="bg-white rounded-xl p-6 mb-6 w-[250px] -mx-6">
              <CategorySection
                title="Office Products"
                items={[
                  { label: "Chair", image: require("../../assets/images/Chair.png") },
                  { label: "Table", image: require("../../assets/images/Table.png") },
                  { label: "Stationary", image: require("../../assets/images/Stationary.png") },
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
