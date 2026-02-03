import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLanguage } from "@/context/LanguageContext"; // Add this import

type Trend = {
  value: string;
  positive?: boolean;
  label?: string;
};

interface MetricCardProps {
  label: string;
  value: string | number;
  valuePrefix?: string;
  subValue?: string;
  icon: string;  // Ensure this is always valid
  trend?: Trend;
  sideColor?: string;
}

export function MetricCard({ 
  label, 
  value, 
  valuePrefix, 
  subValue, 
  icon, 
  trend, 
  sideColor = "#DC2626" 
}: MetricCardProps) {
  const { t } = useLanguage(); // Add this hook

  // Translate trend label if it exists
  const translatedTrendLabel = trend?.label ? t(trend.label) || trend.label : trend?.label;

  return (
    <View className="w-60 bg-[#ECEEF6] rounded-xl p-5 border border-orange-300 shadow-sm relative overflow-hidden">
      {/* Corner accent */}
      <View 
        className="absolute right-0 bottom-0 w-20 h-20"
        style={{ 
          backgroundColor: sideColor,
          borderTopLeftRadius: 90,
        }}
      />
      
      {/* Top Row: icon + label */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-medium text-gray-700">
          {t(label) || label} {/* Use translation for label */}
        </Text>
        {/* FIXED: Safe icon rendering */}
        {icon && (
          <Ionicons name={icon as any} size={18} color={sideColor} />
        )}
      </View>

      <View className="flex-row items-baseline mb-2">
        {valuePrefix && (
          <Text className="text-2xl font-bold text-gray-900 mr-1">
            {t(valuePrefix) || valuePrefix} {/* Use translation for prefix if needed */}
          </Text>
        )}
        <Text className="text-3xl font-bold text-gray-900">
          {String(value)}
        </Text>
      </View>

      {subValue && (
        <Text className="text-sm text-gray-500 mb-3">
          {t(subValue) || subValue} {/* Use translation for subValue */}
        </Text>
      )}

      {trend && (
        <View className="mt-2">
          <View className="flex-row items-center">
            {/* Trend icon */}
            <View 
              className={`w-5 h-5 rounded-full items-center justify-center mr-2 ${
                trend.positive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Ionicons 
                name={trend.positive ? "trending-up" : "trending-down"} 
                size={12} 
                color={trend.positive ? "#16a34a" : "#dc2626"} 
              />
            </View>
            <Text
              className={`text-sm font-semibold ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value}
            </Text>
            {/* FIXED: Safe trend.label */}
            {translatedTrendLabel && (
              <Text className="text-xs text-gray-500 ml-2">
                {translatedTrendLabel}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}