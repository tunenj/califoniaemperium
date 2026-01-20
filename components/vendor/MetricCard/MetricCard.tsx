import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

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
  icon: string;
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
  return (
    <View className="w-60 bg-[#ECEEF6] rounded-xl p-5 border border-orange-300 shadow-sm relative overflow-hidden">
      {/* Corner accent that extends from bottom-right corner */}
      <View 
        className="absolute right-0 bottom-0 w-20 h-20"
        style={{ 
          backgroundColor: sideColor,
          borderTopLeftRadius: 90,
        }}
      />
      
      {/* Top Row: icon + label */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
        <Ionicons name={icon} size={18} color={sideColor} />
      </View>

      <View className="flex-row items-baseline mb-2">
        {valuePrefix && (
          <Text className="text-2xl font-bold text-gray-900 mr-1">{valuePrefix}</Text>
        )}
        <Text className="text-3xl font-bold text-gray-900">
          {value}
        </Text>
      </View>

      {subValue && (
        <Text className="text-sm text-gray-500 mb-3">{subValue}</Text>
      )}

      {trend && (
        <View className="mt-2">
          <View className="flex-row items-center">
            {/* Trend icon inside a circular background */}
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
            <Text className="text-xs text-gray-500 ml-2">{trend.label}</Text>
          </View>
        </View>
      )}

    </View>
  );
}