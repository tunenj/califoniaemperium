// context/WishlistContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext'; 

// API Response Interfaces
interface APIProduct {
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
}

interface APIWishlistItem {
  id: string;
  user: string;
  product: APIProduct;
  created_at: string;
}

interface APIWishlistResponse {
  success: boolean;
  message: string;
  data: APIWishlistItem[];
}

interface APIAddToWishlistResponse {
  success: boolean;
  message: string;
  data: APIWishlistItem;
}

// Local Wishlist Item Interface
export type WishlistItem = {
  id: string; // Wishlist item ID
  productId: string; // Product ID
  storeName: string;
  productName: string;
  price: number;
  originalPrice: number;
  image: string | null;
  isInStock: boolean;
  addedAt: string;
};

type WishlistContextType = {
  items: WishlistItem[];
  loading: boolean;
  syncing: boolean;
  addToWishlist: (productId: string, productData?: Partial<WishlistItem>) => Promise<{success: boolean; message?: string}>;
  removeFromWishlist: (wishlistId: string) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistId: (productId: string) => string | null;
  clearWishlist: () => void;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { isAuthenticated, refreshAccessToken } = useAuth(); // Use auth context

  // Create refs for stable references
  const refreshAccessTokenRef = useRef(refreshAccessToken);
  
  // Update ref when refreshAccessToken changes
  useEffect(() => {
    refreshAccessTokenRef.current = refreshAccessToken;
  }, [refreshAccessToken]);

  // Convert API wishlist items to local format
  const apiToLocalWishlistItem = useCallback((apiItem: APIWishlistItem): WishlistItem => {
    return {
      id: apiItem.id,
      productId: apiItem.product.id,
      storeName: apiItem.product.brand_name || 'Stock',
      productName: apiItem.product.name,
      price: parseFloat(apiItem.product.price),
      originalPrice: apiItem.product.compare_at_price 
        ? parseFloat(apiItem.product.compare_at_price)
        : parseFloat(apiItem.product.price),
      image: apiItem.product.main_image,
      isInStock: apiItem.product.is_in_stock,
      addedAt: apiItem.created_at,
    };
  }, []);

  // Helper function to handle API calls with authentication retry
  const makeAuthenticatedRequest = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    shouldRetry = true
  ): Promise<T | null> => {
    try {
      return await apiCall();
    } catch (error: any) {
      console.error('[Wishlist] API error:', error);
      
      // Handle 401 unauthorized errors
      if (error.response?.status === 401 && shouldRetry) {
        console.log('[Wishlist] Token expired, attempting refresh...');
        
        // Try to refresh the token
        const refreshSuccess = await refreshAccessTokenRef.current();
        
        if (refreshSuccess) {
          console.log('[Wishlist] Token refreshed, retrying request...');
          // Retry the request once with refreshed token
          try {
            return await apiCall();
          } catch (retryError) {
            console.error('[Wishlist] Retry failed:', retryError);
            throw retryError;
          }
        } else {
          console.log('[Wishlist] Token refresh failed');
          Alert.alert('Session Expired', 'Please login again to continue.');
          throw error;
        }
      }
      
      throw error;
    }
  }, []); // Empty dependency array because we use ref for refreshAccessToken

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[Wishlist] Fetching wishlist...');
      
      const response = await makeAuthenticatedRequest(() => 
        api.get<APIWishlistResponse>(endpoints.listWishList)
      );
      
      if (response && response.data.success) {
        console.log('[Wishlist] Wishlist fetched:', response.data.data.length, 'items');
        
        // Convert API items to local format
        const localItems = response.data.data.map(apiToLocalWishlistItem);
        setItems(localItems);
      } else if (response && !response.data.success) {
        console.warn('[Wishlist] API returned success: false');
        setItems([]);
      } else {
        setItems([]);
      }
    } catch (error: any) {
      console.error('[Wishlist] Error fetching wishlist:', error);
      
      if (error.response?.status === 404) {
        console.log('[Wishlist] Wishlist not found, creating empty state');
        setItems([]);
      } else if (error.response?.status === 401) {
        console.log('[Wishlist] Unauthorized, clearing wishlist');
        setItems([]);
      } else {
        // Only show alert for non-auth errors
        if (error.response?.status !== 401) {
          Alert.alert('Error', 'Failed to load wishlist. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, apiToLocalWishlistItem, makeAuthenticatedRequest]);

  // Refresh wishlist (public method)
  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (
    productId: string, 
    productData?: Partial<WishlistItem>
  ): Promise<{success: boolean; message?: string}> => {
    // Don't proceed if not authenticated
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to add items to your wishlist.');
      return { success: false, message: 'Login required' };
    }

    try {
      setSyncing(true);
      
      console.log('[Wishlist] Adding to wishlist:', productId);
      
      const payload = {
        product_id: productId
      };

      const response = await makeAuthenticatedRequest(() =>
        api.post<APIAddToWishlistResponse>(
          endpoints.createWishList,
          payload
        )
      );
      
      if (response && response.data.success) {
        console.log('[Wishlist] Item added to wishlist:', response.data.message);
        
        // Convert and add to local items
        const newItem = apiToLocalWishlistItem(response.data.data);
        setItems(prev => [...prev, newItem]);
        
        Alert.alert('Success', response.data.message || 'Added to wishlist');
        return { success: true, message: response.data.message };
      } else if (response && !response.data.success) {
        console.warn('[Wishlist] API returned success: false');
        const message = response.data.message || 'Failed to add to wishlist';
        Alert.alert('Error', message);
        return { success: false, message };
      } else {
        throw new Error('No response from server');
      }
    } catch (error: any) {
      console.error('[Wishlist] Error adding to wishlist:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add to wishlist';
      
      // Don't show alert for auth errors (handled by makeAuthenticatedRequest)
      if (error.response?.status !== 401) {
        Alert.alert('Error', errorMessage);
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, apiToLocalWishlistItem, makeAuthenticatedRequest]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (wishlistId: string): Promise<boolean> => {
    // Don't proceed if not authenticated
    if (!isAuthenticated) {
      return false;
    }

    try {
      setSyncing(true);
      
      console.log('[Wishlist] Removing from wishlist:', wishlistId);
      
      const response = await makeAuthenticatedRequest(() =>
        api.delete(endpoints.toRemove.replace(':wishlist_id', wishlistId))
      );
      
      // Assuming DELETE returns success
      if (response && (response.status === 200 || response.status === 204)) {
        console.log('[Wishlist] Item removed from wishlist');
        
        // Remove from local items
        setItems(prev => prev.filter(item => item.id !== wishlistId));
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('[Wishlist] Error removing from wishlist:', error);
      
      if (error.response?.status === 404) {
        // Item already removed, update local state
        setItems(prev => prev.filter(item => item.id !== wishlistId));
        return true;
      }
      
      // Don't show alert for auth errors
      if (error.response?.status !== 401) {
        Alert.alert('Error', 'Failed to remove from wishlist');
      }
      
      return false;
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, makeAuthenticatedRequest]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  // Get wishlist item ID for a product
  const getWishlistId = useCallback((productId: string): string | null => {
    const item = items.find(item => item.productId === productId);
    return item ? item.id : null;
  }, [items]);

  // Clear wishlist (local only, for logout, etc.)
  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  // Initial fetch - refetch when auth state changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, isAuthenticated]); // Add isAuthenticated dependency

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        syncing,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist,
        isInWishlist,
        getWishlistId,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};