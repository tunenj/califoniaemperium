import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

import MetricsCarousel from "@/components/vendor/MetricsCarousel/MetricsCarousel";
import RecentOrders from "@/components/admin/RecentOrders";
import LowStockAlert from "@/components/vendor/LowStockAlert/LowStockAlert";
import StatCard from "@/components/admin/StatsCards";

const HomeScreen = () => {
  const { t } = useLanguage(); // Add hook

  return (
    <SafeAreaView className="flex-1 bg-[#FDECEF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 4 }}
      >
        {/* Top metrics */}
        <MetricsCarousel />

        {/* Stats cards */}
        <View className="flex-row gap-2 px-4">
          <StatCard
            icon="time-outline"
            count={1}
            title={t('vendor_pending')}
            subtitle={t('awaiting_approval')}
            color="#F97316" // orange
          />

          <StatCard
            icon="cube-outline"
            count={1}
            title={t('product_pending')}
            subtitle={t('need_moderation')}
            color="#8B5CF6" // purple
          />

          <StatCard
            icon="alert-circle-outline"
            count={3}
            title={t('open_ticket')}
            subtitle={t('need_attention')}
            color="#EF4444" // red
          />
        </View>

        {/* Other sections */}
        <RecentOrders />
        <LowStockAlert />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;