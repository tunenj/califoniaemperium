import React from "react";
import {
  View,
  Text,
  FlatList,
  ImageSourcePropType,
  Dimensions,
  ListRenderItem,
} from "react-native";
import CategoryItem from "./CategoryItem";
import { useLanguage } from "@/context/LanguageContext";

/* ================= TYPES ================= */

export type Category = {
  label: string;
  image: ImageSourcePropType;
};

type CategorySectionProps = {
  title: string;
  items: Category[];
};

/* ================= LAYOUT CONSTANTS ================= */

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - 32 - ITEM_MARGIN * 2 * 3) / 3;

/* ================= COMPONENT ================= */

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  items,
}) => {
  const { t } = useLanguage();

  /* ---------- FlatList renderItem (typed) ---------- */
  const renderItem: ListRenderItem<Category> = ({ item, index }) => {
    return (
      <CategoryItem
        label={String(item.label)} // hard safety
        image={item.image}
        style={{
          width: ITEM_WIDTH,
          marginRight: (index + 1) % 3 === 0 ? 0 : ITEM_MARGIN,
        }}
      />
    );
  };

  return (
    <View>
      {/* ===== Section Header ===== */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-900 font-semibold text-base">
          {t(String(title))}
        </Text>

        <Text className="text-red-600 text-xs">
          {t("see_all")}
        </Text>
      </View>

      {/* ===== Grid Items ===== */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.label}-${index}`}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          marginBottom: ITEM_MARGIN,
        }}
        scrollEnabled={false}
        removeClippedSubviews={false}
      />
    </View>
  );
};

export default CategorySection;
