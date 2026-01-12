import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import DashboardHeader from "@/components/home/DashboardHeader";
import PromoBadges from "@/components/home/PromoBadges";
import CategoryList from "@/components/home/CategoryGrid";
import FeaturedStores from "@/components/home/FeaturedStores";
import ProductSection from "@/components/home/ProductSection";

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1">
      {/* STATIC DASHBOARD */}
      <DashboardHeader />

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        className="flex-1 bg-lightPink"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <PromoBadges />
        <CategoryList />
        <FeaturedStores />
        <ProductSection />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
