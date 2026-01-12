import React from "react";
import { View, Text, FlatList, ImageSourcePropType, Dimensions } from "react-native";
import CategoryItem from "./CategoryItem";

type Category = {
  label: string;
  image: ImageSourcePropType;
};

type CategorySectionProps = {
  title: string;
  items: Category[];
};

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - 32 - ITEM_MARGIN * 2 * 3) / 3; 
// 32 = horizontal padding in ScrollView, ITEM_MARGIN * 2 * 3 = spacing between 3 items

const CategorySection = ({ title, items }: CategorySectionProps) => {
  return (
    <View className="">
      {/* Section header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-900 font-semibold text-base">{title}</Text>
        <Text className="text-red-600 text-xs">See All</Text>
      </View>

      {/* Grid of items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.label}
        numColumns={3} // 3 items horizontally
        columnWrapperStyle={{ justifyContent: "flex-start", marginBottom: ITEM_MARGIN }}
        renderItem={({ item, index }) => (
          <CategoryItem
            label={item.label}
            image={item.image}
            style={{
              width: ITEM_WIDTH,
              marginRight: (index + 1) % 3 === 0 ? 0 : ITEM_MARGIN, // no margin on last item in row
            }}
          />
        )}
        scrollEnabled={false} // main ScrollView handles vertical scroll
      />
    </View>
  );
};

export default CategorySection;
