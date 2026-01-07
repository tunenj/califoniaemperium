import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

interface Props {
  active: string;
  onChange: (value: string) => void;
  categories: string[];
}

const CategoryTabs: React.FC<Props> = ({
  active,
  onChange,
  categories,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 mt-4"
    >
      {categories.map(item => (
        <TouchableOpacity
          key={item}
          onPress={() => onChange(item)}
          className={`px-4 py-2 mr-3 rounded-full ${
            active === item
              ? 'bg-red-600'
              : 'bg-gray-200'
          }`}
        >
          <Text
            className={`text-sm ${
              active === item
                ? 'text-white'
                : 'text-gray-700'
            }`}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryTabs;
