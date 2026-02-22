import React from "react";
import { SafeAreaView, ScrollView, StatusBar, Platform } from "react-native";
import DashboardHeader from "@/components/home/DashboardHeader";
import PromoBadges from "@/components/home/PromoBadges";
import CategoryList from "@/components/home/CategoryGrid";
import FeaturedStores from "@/components/home/FeaturedStores";
import ProductSection from "@/components/home/ProductSection";

const HomeScreen = () => {
  return (
    <>
      {/* Status Bar - iOS specific styling */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={Platform.OS === 'ios'} 
      />
      
      <SafeAreaView className="flex-1 bg-lightPink">
        {/* STATIC DASHBOARD */}
        <DashboardHeader />

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          }}
          // iOS specific scroll props
          decelerationRate="normal"
          scrollEventThrottle={16}
          bounces={true} // iOS bounce effect
          overScrollMode="never" // Prevents Android overscroll effect
        >
          <PromoBadges />
          <CategoryList />
          <FeaturedStores />
          <ProductSection />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;