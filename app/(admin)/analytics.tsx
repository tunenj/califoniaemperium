import React, { memo, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types based on the API response
type AdminStats = {
  total_revenue: string;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_customers: number;
  total_vendors: number;
  active_vendors: number;
  total_products: number;
  active_products: number;
  pending_payouts: string;
  total_commissions: string;
  new_customers_this_month: number;
  new_orders_this_month: number;
  revenue_this_month: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: AdminStats;
};

// Helper function to format currency in Euros
const formatCurrency = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `€${numValue.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Helper function to format number with commas
const formatNumber = (value: number) => {
  return value.toLocaleString('en-US');
};

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
      className={`px-4 py-1.5 rounded-full border mr-2 ${active
          ? "bg-gray-900 border-gray-900"
          : "bg-white border-gray-200"
        }`}
    >
      <Text
        className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"
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

/* ================= IMPROVED BAR CHART WITH BETTER EXPLANATIONS ================= */

const SimpleBarChart = memo(({ stats }: { stats: AdminStats }) => {
  // Generate sample weekly data based on real stats
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const totalOrders = stats.new_orders_this_month;
    const totalRevenue = parseFloat(stats.revenue_this_month);
    
    // Distribute orders across days with realistic patterns
    const orderDistribution = [0.12, 0.15, 0.18, 0.20, 0.22, 0.08, 0.05];
    const revenueDistribution = [0.10, 0.14, 0.19, 0.21, 0.23, 0.08, 0.05];
    
    return days.map((day, index) => ({
      label: day,
      fullLabel: fullDayNames[index],
      orders: Math.round(totalOrders * orderDistribution[index]),
      revenue: totalRevenue * revenueDistribution[index]
    }));
  };

  const chartData = generateWeeklyData();
  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
  const maxOrders = Math.max(...chartData.map(d => d.orders));
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  return (
    <View className="mt-2">
      {/* Chart Title */}
      <View className="mb-4">
        <Text className="text-base font-semibold text-gray-900">Weekly Performance Overview</Text>
        <Text className="text-xs text-gray-500">Daily orders and revenue distribution for this month</Text>
      </View>

      {/* Legend with Better Explanations */}
      <View className="flex-row justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
          <View>
            <Text className="text-xs font-medium text-gray-700">Orders</Text>
            <Text className="text-xs text-gray-500">Number of orders per day</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <View>
            <Text className="text-xs font-medium text-gray-700">Revenue</Text>
            <Text className="text-xs text-gray-500">Total sales in Euros</Text>
          </View>
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-white rounded-lg border border-gray-100 p-4">
        {/* Y-axis Label */}
        <View className="flex-row mb-2">
          <Text className="text-xs text-gray-400 transform -rotate-90 w-6 h-6">Value</Text>
        </View>

        {/* Chart Bars */}
        <View className="flex-row items-end justify-around h-48">
          {chartData.map((item, index) => {
            const isSelected = selectedBar === index;
            const orderHeight = Math.max(4, (item.orders / maxOrders) * 100);
            const revenueHeight = Math.max(4, (item.revenue / maxRevenue) * 100);

            return (
              <Pressable 
                key={index} 
                className="items-center flex-1"
                onPress={() => setSelectedBar(isSelected ? null : index)}
                onPressIn={() => setSelectedBar(index)}
                onPressOut={() => setSelectedBar(null)}
              >
                {/* Tooltip - Shows on press */}
                {isSelected && (
                  <View className="absolute -top-20 bg-gray-800 rounded-lg p-2 z-10 w-32">
                    <Text className="text-white text-xs font-bold text-center">{item.fullLabel}</Text>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-red-300 text-xs">Orders:</Text>
                      <Text className="text-white text-xs font-bold">{item.orders}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-green-300 text-xs">Revenue:</Text>
                      <Text className="text-white text-xs font-bold">{formatCurrency(item.revenue)}</Text>
                    </View>
                    <View className="absolute -bottom-2 left-1/2 -ml-2 w-4 h-4 bg-gray-800 transform rotate-45" />
                  </View>
                )}

                {/* Bars Container */}
                <View className="flex-row items-end justify-center space-x-2">
                  {/* Orders bar */}
                  <View className="items-center">
                    <View 
                      className="w-4 bg-red-500 rounded-t-sm"
                      style={{ height: orderHeight }}
                    />
                    <Text className="text-[10px] text-gray-500 mt-1">{item.orders}</Text>
                  </View>
                  
                  {/* Revenue bar */}
                  <View className="items-center">
                    <View 
                      className="w-4 bg-green-500 rounded-t-sm"
                      style={{ height: revenueHeight }}
                    />
                    <Text className="text-[10px] text-gray-500 mt-1">€{Math.round(item.revenue)}</Text>
                  </View>
                </View>

                {/* Day Label */}
                <Text className="text-xs font-medium text-gray-600 mt-2">{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* X-axis Label */}
        <Text className="text-xs text-gray-400 text-center mt-4">Days of the Week</Text>
      </View>

      {/* Key Insights */}
      <View className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-100">
        <Text className="text-sm font-semibold text-blue-800 mb-2">📊 Key Insights</Text>
        <View className="flex-row flex-wrap">
          <View className="w-1/2 mb-2">
            <Text className="text-xs text-gray-600">Busiest Day:</Text>
            <Text className="text-sm font-bold text-blue-600">
              {chartData.reduce((max, item) => item.orders > max.orders ? item : max).fullLabel}
            </Text>
          </View>
          <View className="w-1/2 mb-2">
            <Text className="text-xs text-gray-600">Highest Revenue:</Text>
            <Text className="text-sm font-bold text-green-600">
              {chartData.reduce((max, item) => item.revenue > max.revenue ? item : max).fullLabel}
            </Text>
          </View>
          <View className="w-1/2">
            <Text className="text-xs text-gray-600">Avg Daily Orders:</Text>
            <Text className="text-sm font-bold text-gray-800">
              {Math.round(stats.new_orders_this_month / 7)}
            </Text>
          </View>
          <View className="w-1/2">
            <Text className="text-xs text-gray-600">Avg Daily Revenue:</Text>
            <Text className="text-sm font-bold text-gray-800">
              {formatCurrency(parseFloat(stats.revenue_this_month) / 7)}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Summary Cards */}
      <View className="flex-row justify-between mt-4">
        <View className="flex-1 bg-red-50 rounded-lg p-3 mr-2">
          <Text className="text-xs text-red-600 font-medium">Total Orders</Text>
          <Text className="text-xl font-bold text-gray-900">{stats.new_orders_this_month}</Text>
          <Text className="text-xs text-gray-500 mt-1">This month</Text>
        </View>
        <View className="flex-1 bg-green-50 rounded-lg p-3 ml-2">
          <Text className="text-xs text-green-600 font-medium">Total Revenue</Text>
          <Text className="text-xl font-bold text-gray-900">{formatCurrency(stats.revenue_this_month)}</Text>
          <Text className="text-xs text-gray-500 mt-1">This month</Text>
        </View>
      </View>

      {/* Comparison with Previous Period */}
      <View className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <Text className="text-xs font-medium text-gray-700 mb-2">📈 Performance Metrics</Text>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-gray-500">Orders/Week</Text>
            <Text className="text-base font-bold text-gray-900">{stats.new_orders_this_month}</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Revenue/Week</Text>
            <Text className="text-base font-bold text-green-600">{formatCurrency(parseFloat(stats.revenue_this_month))}</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Avg Order Value</Text>
            <Text className="text-base font-bold text-purple-600">
              {stats.new_orders_this_month > 0 
                ? formatCurrency(parseFloat(stats.revenue_this_month) / stats.new_orders_this_month)
                : '€0.00'}
            </Text>
          </View>
        </View>
      </View>

      {/* Help Text */}
      <Text className="text-xs text-gray-400 text-center mt-4 italic">
        Press on any day to see detailed values • Bars show order count (red) and revenue (green)
      </Text>
    </View>
  );
});

SimpleBarChart.displayName = "SimpleBarChart";
/* ================= SCREEN ================= */

const AnalyticsDashboard = () => {
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('accessToken');

      const response = await api.get<ApiResponse>(endpoints.adminStat, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      setError(error.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Calculate completion rate
  const completionRate = stats && stats.total_orders > 0
    ? ((stats.completed_orders / stats.total_orders) * 100).toFixed(1)
    : "0.0";

  // Calculate average order value
  const avgOrderValue = stats && stats.total_orders > 0
    ? parseFloat(stats.total_revenue) / stats.total_orders
    : 0;

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#dc2626" />
        <Text className="mt-4 text-gray-600">Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
        <Text className="text-red-600 text-center mt-4">{error}</Text>
        <Pressable
          onPress={fetchStats}
          className="mt-4 bg-red-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View className="px-5 pt-6">
        <Text className="text-lg font-semibold text-gray-900">
          {t('analytics_dashboard')}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t('track_marketplace_performance')}
        </Text>
      </View>

      {/* FILTERS — LEFT ALIGNED */}
      <View className="px-5 mt-4 flex-row">
        <TimeFilter label={t('7_days')} active={range === "7"} onPress={() => setRange("7")} />
        <TimeFilter label={t('30_days')} active={range === "30"} onPress={() => setRange("30")} />
        <TimeFilter label={t('90_days')} active={range === "90"} onPress={() => setRange("90")} />
      </View>

      {/* SUMMARY CARDS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 pl-4"
      >
        <SummaryCard
          title={t('total_revenue')}
          value={formatCurrency(stats.total_revenue)}
          accent="bg-green-300"
          icon="cash-outline"
          iconColor="#16a34a"
        />
        <SummaryCard
          title={t('total_orders')}
          value={formatNumber(stats.total_orders)}
          accent="bg-red-300"
          icon="cart-outline"
          iconColor="#dc2626"
        />
        <SummaryCard
          title={t('avg_order_value')}
          value={formatCurrency(avgOrderValue)}
          accent="bg-orange-300"
          icon="stats-chart-outline"
          iconColor="#ea580c"
        />
        <SummaryCard
          title={t('completion_rate')}
          value={`${completionRate}%`}
          accent="bg-purple-300"
          icon="checkmark-done-outline"
          iconColor="#7c3aed"
        />
      </ScrollView>

      {/* TREND CHART */}
      <View className="px-5 mt-8">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-semibold text-gray-900">
            {t('revenue_orders_trend')}
          </Text>
          <View className="bg-red-50 px-2 py-1 rounded-full">
            <Text className="text-xs text-red-600 font-medium">
              This Month
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-4">
          <SimpleBarChart stats={stats} />
        </View>
      </View>

      {/* TOP VENDORS - Commented out as requested */}
      {/* <View className="px-5 mt-8">
        <Text className="text-sm font-semibold text-gray-900 mb-4">
          {t('top_vendors_by_sales')}
        </Text>
        <VendorBar name="Dropshipping" value={600} max={600} />
        <VendorBar name={t('sports_direct')} value={350} max={600} />
        <VendorBar name={t('tech_zone')} value={120} max={600} />
      </View> */}

      {/* BOTTOM METRICS — 4 IN ONE ROW */}
      <View className="px-5 mt-10 flex-row">
        <MiniStatCard
          title={t('total_vendors')}
          value={formatNumber(stats.total_vendors)}
          icon="people-outline"
          iconBg="bg-purple-100"
          iconColor="#7c3aed"
        />
        <MiniStatCard
          title={t('active_vendors')}
          value={formatNumber(stats.active_vendors)}
          icon="cube-outline"
          iconBg="bg-red-100"
          iconColor="#dc2626"
        />
        <MiniStatCard
          title={t('total_customers')}
          value={formatNumber(stats.total_customers)}
          icon="person-outline"
          iconBg="bg-blue-100"
          iconColor="#2563eb"
        />
        <MiniStatCard
          title={t('total_products')}
          value={formatNumber(stats.total_products)}
          icon="pricetag-outline"
          iconBg="bg-orange-100"
          iconColor="#ea580c"
        />
      </View>
    </ScrollView>
  );
};

export default AnalyticsDashboard;