import React from "react";
import { ScrollView } from "react-native";
import MetricsCarousel from "@/components/vendor/MetricsCarousel/MetricsCarousel";
import RecentOrders from "@/components/vendor/RecentOrders/RecentOrders";
import LowStockAlert from "@/components/vendor/LowStockAlert/LowStockAlert";

export default function DashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-white px-0.5 pt-4">
      <MetricsCarousel />
      <RecentOrders />
      <LowStockAlert />
    </ScrollView>
  );
}
