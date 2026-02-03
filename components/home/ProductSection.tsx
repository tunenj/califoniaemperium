import React, { useState } from 'react';
import { View } from 'react-native';
import { products } from '@/data/products';
import TrendingNow from '@/components/TrendingNow';
import PromoBanner from '@/components/home/PromoBanner';
import ProductGrid from '@/components/home/ProductGrid';

const ProductSection = () => {
  const [activeCategory] = useState('All');

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter(
          item => item.category === activeCategory
        );

  return (
    <View>
      <TrendingNow />
      <PromoBanner />
      <ProductGrid products={filteredProducts} />
    </View>
  );
};

export default ProductSection;
