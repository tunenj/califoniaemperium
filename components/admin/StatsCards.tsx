import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/context/LanguageContext"; // Add import

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  title: string;
  subtitle: string;
  color: string; // used for icon, text & border
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  count,
  title,
  subtitle,
  color,
}) => {
  const { t } = useLanguage(); // Add hook

  return (
    <View
      className="flex-1 rounded-2xl p-4 bg-white border"
      style={{ borderColor: color }}
    >
      {/* Icon + Count */}
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon} size={22} color={color} />
        <Text
          className="ml-2 text-lg font-bold"
          style={{ color }}
        >
          {count}
        </Text>
      </View>

      {/* Title */}
      <Text
        className="text-sm font-semibold"
        style={{ color }}
      >
        {t(title)} {/* Wrap title with t() function */}
      </Text>

      {/* Subtitle */}
      <Text
        className="text-xs mt-1"
        style={{ color }}
      >
        {t(subtitle)} {/* Wrap subtitle with t() function */}
      </Text>
    </View>
  );
};

export default StatCard;