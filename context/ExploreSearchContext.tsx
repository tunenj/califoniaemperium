// context/ExploreSearchContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ExploreSearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

const ExploreSearchContext = createContext<ExploreSearchContextType | undefined>(undefined);

export const useExploreSearch = () => {
  const context = useContext(ExploreSearchContext);
  if (!context) {
    throw new Error('useExploreSearch must be used within ExploreSearchProvider');
  }
  return context;
};

interface ExploreSearchProviderProps {
  children: ReactNode;
}

export const ExploreSearchProvider: React.FC<ExploreSearchProviderProps> = ({ children }) => {
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
    <ExploreSearchContext.Provider value={value}>
      {children}
    </ExploreSearchContext.Provider>
  );
};