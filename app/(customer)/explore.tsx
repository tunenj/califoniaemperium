import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View } from "react-native";
import DashboardHeader from "@/components/explore/dashboard";
import TrendingNow from "@/components/TrendingNow";
import { products } from '@/data/products';

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter(
        item => item.category === activeCategory
      );
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
        <View>
          <TrendingNow products={products.filter((p) => p.trending)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Explore;
