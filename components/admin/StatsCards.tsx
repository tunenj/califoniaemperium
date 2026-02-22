import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/context/LanguageContext";

// Export the interface so it can be used elsewhere
export interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  title: string;
  subtitle: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  count,
  title,
  subtitle,
  color,
}) => {
  const { t } = useLanguage();

  return (
    <View
      className="flex-1 rounded-2xl p-4 bg-white border"
      style={{ borderColor: color }}
    >
      {/* Icon + Count */}
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon} size={22} color={color} />
        <Text className="ml-2 text-lg font-bold" style={{ color }}>
          {count}
        </Text>
      </View>

      {/* Title */}
      <Text className="text-sm font-semibold" style={{ color }}>
        {t(title)}
      </Text>

      {/* Subtitle */}
      <Text className="text-xs mt-1" style={{ color }}>
        {t(subtitle)}
      </Text>
    </View>
  );
};

export default StatCard;