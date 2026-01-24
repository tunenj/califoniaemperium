import React from 'react';
import { View, Text } from 'react-native';
import { Truck, Zap } from 'lucide-react-native';
import { colors } from "@/constants/color";
import { useLanguage } from '@/context/LanguageContext'; // Add this import

const PromoBadges = () => {
  const { t } = useLanguage(); // Add this hook

  return (
    <View className="flex-row px-4 justify-between pt-4">
      <View className="flex-row items-center p-3 rounded-xl w-[48%]">
        <Truck size={25} color={colors.darkRed} />
        <View className="ml-2">
          <Text className="font-semibold text-lg text-darkRed">
            {t("free_shipping") || "Free Shipping"} {/* Use translation */}
          </Text>
          <Text className="text-xs text-darkRed">
            {t("buy_more_for_free_shipping") || "Buy ₦102,000 more to get"} {/* Use translation */}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center p-3 w-[48%] ml-4">
        <Zap size={25} color={colors.darkRed} />
        <View className="ml-2">
          <Text className="font-semibold text-lg text-darkRed">
            {t("super_deals") || "Super Deals"} {/* Use translation */}
          </Text>
          <Text className="text-xs text-darkRed">
            {t("view_more") || "View more"} {/* Use translation */}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PromoBadges;