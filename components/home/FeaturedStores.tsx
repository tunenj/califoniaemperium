import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import StoreCard from "./StoreCard";
import images from "@/constants/images";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext"; // Add this import

const FeaturedStores = () => {
  const router = useRouter();
  const { t } = useLanguage(); // Add this hook

  const cardData = [
    {
      id: "techhub",
      title: "TechHub",
      bg: images.electronicsBg,
      front: images.electronicsIcon,
      translationKey: "techhub_store", // Add translation key
    },
    {
      id: "fashion",
      title: "Fashion Forward",
      bg: images.fashionBg,
      front: images.fashionIcon,
      translationKey: "fashion_forward_store", // Add translation key
    },
    {
      id: "home",
      title: "Home Essential",
      bg: images.groceryBg,
      front: images.groceryIcon,
      translationKey: "home_essential_store", // Add translation key
    },
    {
      id: "sports",
      title: "Sports Zone",
      bg: images.computerBg,
      front: images.computerIcon,
      translationKey: "sports_zone_store", // Add translation key
    },
  ];

  return (
    <View className="mt-2 px-4 bg-white rounded-2xl mx-2">
      {/* Header */}
      <View className="flex-row justify-between mb-3 mt-6">
        <View>
          <Text className="font-semibold text-base">
            {t("featured_stores") || "Featured Stores"} {/* Use translation */}
          </Text>
          <Text className="text-xs text-gray-500">
            {t("discover_top_rated_vendors") || "Discover top-rated vendors"} {/* Use translation */}
          </Text>
        </View>

        <TouchableOpacity className="flex-row items-center space-x-1">
          <Text className="text-darkRed text-sm">
            {t("view_more") || "View more"} {/* Use translation */}
          </Text>
          <ChevronRight size={16} color={colors.darkRed} />
        </TouchableOpacity>
      </View>

      {/* Store Cards */}
      <View className="flex-row flex-wrap justify-between">
        {cardData.map((item) => (
          <StoreCard
            key={item.id}
            title={t(item.translationKey) || item.title}
            bg={item.bg}
            front={item.front}
            onVisitStore={() =>
              router.push({
                pathname: "/(customer)/store",
                params: { storeId: item.id },
              })
            }
            onFollow={() => console.log("Follow", item.title)}
          />
        ))}
      </View>
    </View>
  );
};

export default FeaturedStores;