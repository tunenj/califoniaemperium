import React, { memo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* ================= TIME FILTER ================= */

const TimeFilter = memo(
  ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className={`px-4 py-1.5 rounded-full border mr-2 ${
        active
          ? "bg-gray-900 border-gray-900"
          : "bg-white border-gray-200"
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          active ? "text-white" : "text-gray-600"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
);

TimeFilter.displayName = "TimeFilter";

/* ================= SUMMARY CARD ================= */

const SummaryCard = memo(
  ({
    title,
    value,
    accent,
    icon,
    iconColor,
  }: {
    title: string;
    value: string;
    accent: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
  }) => (
    <View className="w-44 h-44 bg-white rounded-2xl p-4 border border-gray-200 mr-3 overflow-hidden">
      {/* Accent */}
      <View
        className={`absolute bottom-[-30px] right-[-30px] w-36 h-36 rounded-full ${accent}`}
      />

      {/* Icon */}
      <View className="absolute top-3 right-3">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <Text className="text-xs text-gray-500">{title}</Text>
      <Text className="text-xl font-bold text-gray-900 mt-2">{value}</Text>
    </View>
  )
);

SummaryCard.displayName = "SummaryCard";

/* ================= VENDOR BAR ================= */

const VendorBar = memo(
  ({
    name,
    value,
    max,
  }: {
    name: string;
    value: number;
    max: number;
  }) => {
    const width = (value / max) * 100;

    return (
      <View className="flex-row items-center mb-4">
        {/* Y-axis label */}
        <Text className="w-24 text-xs text-gray-700">{name}</Text>

        {/* X-axis bar */}
        <View className="flex-1 h-4 bg-red-100 rounded-full overflow-hidden">
          <View
            style={{ width: `${width}%` }}
            className="h-full bg-red-500 rounded-full"
          />
        </View>

        {/* Value */}
        <Text className="w-10 text-xs text-gray-500 text-right">
          {value}
        </Text>
      </View>
    );
  }
);

VendorBar.displayName = "VendorBar";

/* ================= MINI STAT CARD ================= */

const MiniStatCard = memo(
  ({
    title,
    value,
    icon,
    iconBg,
    iconColor,
  }: {
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
  }) => (
    <View className="flex-1 bg-white rounded-2xl p-3 border border-gray-200 mr-2">
      <View
        className={`w-8 h-8 rounded-xl items-center justify-center ${iconBg}`}
      >
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text className="text-xs text-gray-500 mt-2">{title}</Text>
      <Text className="text-base font-bold text-gray-900 mt-1">
        {value}
      </Text>
    </View>
  )
);

MiniStatCard.displayName = "MiniStatCard";

/* ================= SCREEN ================= */

const AnalyticsDashboard = () => {
  const [range, setRange] = useState<"7" | "30" | "90">("30");

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View className="px-5 pt-6">
        <Text className="text-lg font-semibold text-gray-900">
          Analytics Dashboard
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Track your marketplace performance
        </Text>
      </View>

      {/* FILTERS — LEFT ALIGNED */}
      <View className="px-5 mt-4 flex-row">
        <TimeFilter label="7Days" active={range === "7"} onPress={() => setRange("7")} />
        <TimeFilter label="30Days" active={range === "30"} onPress={() => setRange("30")} />
        <TimeFilter label="90Days" active={range === "90"} onPress={() => setRange("90")} />
      </View>

      {/* SUMMARY CARDS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 pl-4"
      >
        <SummaryCard
          title="Total Revenue"
          value="₦2,000,000"
          accent="bg-green-300"
          icon="cash-outline"
          iconColor="#16a34a"
        />
        <SummaryCard
          title="Total Orders"
          value="20"
          accent="bg-red-300"
          icon="cart-outline"
          iconColor="#dc2626"
        />
        <SummaryCard
          title="Avg. Order Value"
          value="₦2,000,000"
          accent="bg-orange-300"
          icon="stats-chart-outline"
          iconColor="#ea580c"
        />
        <SummaryCard
          title="Completion Rate"
          value="20.5%"
          accent="bg-purple-300"
          icon="checkmark-done-outline"
          iconColor="#7c3aed"
        />
      </ScrollView>

      {/* TREND */}
      <View className="px-5 mt-8">
        <Text className="text-sm font-semibold text-gray-900 mb-3">
          Revenue & Orders Trend
        </Text>

        <View className="h-48 bg-red-50 rounded-xl items-center justify-center">
          <Text className="text-xs text-gray-500">
            Chart placeholder
          </Text>
        </View>
      </View>

      {/* TOP VENDORS */}
      <View className="px-5 mt-8">
        <Text className="text-sm font-semibold text-gray-900 mb-4">
          Top Vendors by Sales
        </Text>

        <VendorBar name="Dropshipping" value={600} max={600} />
        <VendorBar name="Sports Direct" value={350} max={600} />
        <VendorBar name="TechZone" value={120} max={600} />
      </View>

      {/* BOTTOM METRICS — 4 IN ONE ROW */}
      <View className="px-5 mt-10 mb-12 flex-row">
        <MiniStatCard
          title="Total Vendors"
          value="15"
          icon="people-outline"
          iconBg="bg-purple-100"
          iconColor="#7c3aed"
        />
        <MiniStatCard
          title="Dropshipping"
          value="50"
          icon="cube-outline"
          iconBg="bg-red-100"
          iconColor="#dc2626"
        />
        <MiniStatCard
          title="Customers"
          value="30"
          icon="person-outline"
          iconBg="bg-blue-100"
          iconColor="#2563eb"
        />
        <MiniStatCard
          title="Products"
          value="80"
          icon="pricetag-outline"
          iconBg="bg-orange-100"
          iconColor="#ea580c"
        />
      </View>
    </ScrollView>
  );
};

export default AnalyticsDashboard;
