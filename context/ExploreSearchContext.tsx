// context/ExploreSearchContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Types for image search
interface ImageSearchResult {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  product_type: string;
  category_name: string;
  brand_name: string | null;
  price: string;
  compare_at_price: string | null;
  discount_percentage: number;
  main_image: string | null;
  is_in_stock: boolean;
  is_featured: boolean;
  rating_average: string;
  rating_count: number;
  condition: string;
  created_at: string;
  similarity_score: number;
}

interface ExploreSearchContextType {
  // Text search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // Image search
  imageSearchImage: string | null;
  setImageSearchImage: (imageUri: string | null) => void;
  imageSearchResults: ImageSearchResult[];
  setImageSearchResults: (results: ImageSearchResult[]) => void;
  isImageSearching: boolean;
  setIsImageSearching: (isSearching: boolean) => void;
  clearImageSearch: () => void;
  
  // Combined state
  isSearchActive: boolean;
  searchType: 'text' | 'image' | null;
  setSearchType: (type: 'text' | 'image' | null) => void;
  resetAllSearches: () => void;
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
  // Text search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Image search state
  const [imageSearchImage, setImageSearchImage] = useState<string | null>(null);
  const [imageSearchResults, setImageSearchResults] = useState<ImageSearchResult[]>([]);
  const [isImageSearching, setIsImageSearching] = useState(false);
  const [searchType, setSearchType] = useState<'text' | 'image' | null>(null);

  const clearSearch = () => {
    setSearchQuery('');
    if (searchType === 'text') {
      setSearchType(null);
    }
  };

  const clearImageSearch = () => {
    setImageSearchImage(null);
    setImageSearchResults([]);
    setIsImageSearching(false);
    if (searchType === 'image') {
      setSearchType(null);
    }
  };

  const resetAllSearches = () => {
    setSearchQuery('');
    setImageSearchImage(null);
    setImageSearchResults([]);
    setIsImageSearching(false);
    setSearchType(null);
  };

  // Determine if any search is active
  const isSearchActive = !!(searchQuery || imageSearchImage || imageSearchResults.length > 0 || isImageSearching);

  const value = {
    // Text search
    searchQuery,
    setSearchQuery,
    clearSearch,
    
    // Image search
    imageSearchImage,
    setImageSearchImage,
    imageSearchResults,
    setImageSearchResults,
    isImageSearching,
    setIsImageSearching,
    clearImageSearch,
    
    // Combined state
    isSearchActive,
    searchType,
    setSearchType,
    resetAllSearches,
  };

  return (
    <ExploreSearchContext.Provider value={value}>
      {children}
    </ExploreSearchContext.Provider>
  );
};

// Export the type for use in other components
export type { ImageSearchResult };