import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  title: string;
  subtitle: string;
  bg: "bg-orange-100" | "bg-purple-100" | "bg-red-100";
  text: string;
}

const borderMap: Record<StatCardProps["bg"], string> = {
  "bg-orange-100": "border-orange-400",
  "bg-purple-100": "border-purple-400",
  "bg-red-100": "border-red-400",
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  count,
  title,
  subtitle,
  bg,
  text,
}) => {
  return (
    <View
      className={`flex-1 rounded-2xl p-4 border ${bg} ${borderMap[bg]}`}
    >
      {/* Icon + Count */}
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon} size={22} color={text} />
        <Text className="ml-2 text-lg font-bold" style={{ color: text }}>
          {count}
        </Text>
      </View>

      {/* Title */}
      <Text className="text-sm font-semibold" style={{ color: text }}>
        {title}
      </Text>

      {/* Subtitle */}
      <Text className="text-xs mt-1" style={{ color: text }}>
        {subtitle}
      </Text>
    </View>
  );
};

export default StatCard;
