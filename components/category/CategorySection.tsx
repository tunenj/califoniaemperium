import React from "react";
import {
  View,
  Text,
  FlatList,
  ImageSourcePropType,
  Dimensions,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import CategoryItem from "./CategoryItem";
import { useLanguage } from "@/context/LanguageContext";

/* ================= TYPES ================= */

export type Category = {
  label: string;
  image: { uri: string } | ImageSourcePropType | null;
  price?: string;
  discount?: number;
  productId?: string;
};

type CategorySectionProps = {
  title: string;
  items: Category[];
  onSeeAllPress?: () => void;
};

/* ================= LAYOUT CONSTANTS ================= */

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - 32 - ITEM_MARGIN * 2 * 3) / 3;

/* ================= COMPONENT ================= */

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  items = [],
  onSeeAllPress,
}) => {
  const { t } = useLanguage();

  /* ---------- FlatList renderItem (typed) ---------- */
  const renderItem: ListRenderItem<Category> = ({ item, index }) => {
    return (
      <CategoryItem
        label={String(item.label)}
        image={item.image}
        price={item.price}
        discount={item.discount}
        productId={item.productId}
        style={{
          width: ITEM_WIDTH,
          marginRight: (index + 1) % 3 === 0 ? 0 : ITEM_MARGIN,
          marginBottom: ITEM_MARGIN,
        }}
      />
    );
  };

  return (
    <View>
      {/* ===== Section Header ===== */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-900 font-semibold text-base">
          {title}
        </Text>

        {onSeeAllPress && items.length > 6 && (
          <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
            <Text className="text-red-600 text-xs font-medium">
              {t("see_all")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== Grid Items ===== */}
      {items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.productId || item.label}-${index}`}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "flex-start",
          }}
          scrollEnabled={false}
          removeClippedSubviews={false}
        />
      ) : (
        <View className="py-8 items-center">
          <Text className="text-gray-500 text-sm">
            {t('no_products_available') || 'No products available'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CategorySection;