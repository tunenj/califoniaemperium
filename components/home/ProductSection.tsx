import React, { useState } from 'react';
import { View } from 'react-native';
import { products, categories } from '@/data/products';
import TrendingNow from '@/components/TrendingNow';
import PromoBanner from '@/components/home/PromoBanner';
import ProductGrid from '@/components/home/ProductGrid';

const ProductSection = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter(
          item => item.category === activeCategory
        );

  return (
    <View>
      <TrendingNow
        products={products.filter(p => p.trending)}
      />
      <PromoBanner />
      <ProductGrid products={filteredProducts} />
    </View>
  );
};

export default ProductSection;
