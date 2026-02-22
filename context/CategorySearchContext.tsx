// context/CategorySearchContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface CategorySearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

const CategorySearchContext = createContext<CategorySearchContextType | undefined>(undefined);

export const useCategorySearch = () => {
  const context = useContext(CategorySearchContext);
  if (!context) {
    throw new Error('useCategorySearch must be used within CategorySearchProvider');
  }
  return context;
};

interface CategorySearchProviderProps {
  children: ReactNode;
}

export const CategorySearchProvider: React.FC<CategorySearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const clearSearch = () => {
    setSearchQuery('');
  };

  const value = {
    searchQuery,
    setSearchQuery,
    clearSearch,
  };

  return (
    <CategorySearchContext.Provider value={value}>
      {children}
    </CategorySearchContext.Provider>
  );
};