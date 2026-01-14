import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

const sidebarItems = [
  "Phones & Tablets",
  "Fashion",
  "Electronics",
  "Computing",
  "Grocery",
  "Home & Kitchen",
  "Furniture",
  "Gaming",
  "Baby Products",
];

const SidebarMenu = () => {
  return (
    <View>
      <View
        className="px-4 py-4 border-b border-gray-200 bg-lightPink"
        style={{ width: 100 }}
      >
        <Text className="text-lg text-gray-900 border-l-8 h-20 border-darkRed pl-3 pt-3">
          Home & office
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="max-w-36 max-h-[400px] border-r border-gray-200 bg-white rounded-xl"
      >
        {sidebarItems.map((item) => (
          <TouchableOpacity
            key={item}
            className="py-2 px-4 border rounded border-gray-100"
          >
            <Text className="text-base text-gray-900">{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SidebarMenu;
