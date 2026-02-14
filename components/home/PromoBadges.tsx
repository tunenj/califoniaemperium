import React from 'react';
import { View, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from "@/constants/color";
import { useLanguage } from '@/context/LanguageContext';

const PromoBadges = () => {
  const { t } = useLanguage();

  return (
    <View className="flex-row px-4 justify-between pt-4">
      <View className="flex-row items-center p-3 rounded-xl w-[48%]">
        <Feather name="truck" size={25} color={colors.darkRed} />
        <View className="ml-2">
          <Text className="font-semibold text-lg text-darkRed">
            {t("free_shipping") || "Free Shipping"}
          </Text>
          <Text className="text-xs text-darkRed">
            {t("buy_more_for_free_shipping") || "Buy ₦102,000 more to get"}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center p-3 w-[48%] ml-4">
        <MaterialCommunityIcons name="lightning-bolt" size={25} color={colors.darkRed} />
        <View className="ml-2">
          <Text className="font-semibold text-lg text-darkRed">
            {t("super_deals") || "Super Deals"}
          </Text>
          <Text className="text-xs text-darkRed">
            {t("view_more") || "View more"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PromoBadges;