import React from 'react';
import { View } from 'react-native';
import TrendingNow from '@/components/TrendingNow';
import PromoBanner from '@/components/home/PromoBanner';
import ProductGrid from '@/components/home/ProductGrid';

const ProductSection = () => {

 

  return (
    <View>
      <TrendingNow />
      <PromoBanner />
      <ProductGrid />
    </View>
  );
};

export default ProductSection;
