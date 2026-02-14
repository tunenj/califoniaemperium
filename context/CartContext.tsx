// context/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

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

interface APICartItem {
  id: string;
  product: APIProduct;
  variant: any;
  quantity: number;
  price: string;
  total_price: string;
  created_at: string;
  updated_at: string;
}

interface APICart {
  id: string;
  user: string;
  session_key: string | null;
  items: APICartItem[];
  total_items: number;
  subtotal: string;
  total: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface APIResponse {
  success: boolean;
  message: string;
  data: APICart;
}

// Local Cart Item Interface - Using 'image' only, not 'productImage'
type CartItem = {
  id: string; // This will be the cart item ID from API
  productId: string; // Product ID
  storeName: string;
  productName: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: any; // This contains the product image data (string URL or image object)
  size?: string;
  color?: string;
  variantId?: string; // Optional variant ID
};

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  syncing: boolean;
  cartData: APICart | null;
  addItem: (item: Omit<CartItem, 'quantity' | 'id'>, quantity?: number) => Promise<{success: boolean; message?: string}>;
  removeItem: (cartItemId: string) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  moveToSaved: (id: string) => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  savedItems: CartItem[];
  restoreFromSaved: (id: string) => void;
  removeFromSaved: (id: string) => void;
  refreshCart: () => Promise<void>;
  syncCartToServer: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getCartItemId: (productId: string) => string | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [cartData, setCartData] = useState<APICart | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Convert API cart items to local format
  const apiToLocalCartItem = (apiItem: APICartItem): CartItem => {
    return {
      id: apiItem.id,
      productId: apiItem.product.id,
      storeName: apiItem.product.brand_name || 'Stock',
      productName: apiItem.product.name,
      price: parseFloat(apiItem.price),
      originalPrice: apiItem.product.compare_at_price 
        ? parseFloat(apiItem.product.compare_at_price)
        : parseFloat(apiItem.price),
      quantity: apiItem.quantity,
      image: apiItem.product.main_image, // This is the image data (string URL or null)
      variantId: apiItem.variant?.id,
    };
  };

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<APIResponse>(endpoints.toGetCart);
      
      if (response.data.success) {
        setCartData(response.data.data);
        
        // Convert API items to local format
        const localItems = response.data.data.items.map(apiToLocalCartItem);
        setItems(localItems);
      }
    } catch (error: any) {
      // If cart doesn't exist (404), create an empty cart state
      if (error.response?.status === 404) {
        setCartData(null);
        setItems([]);
      } else {
        console.error('Error fetching cart:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart (API integration)
  const addItem = async (
    item: Omit<CartItem, 'quantity' | 'id'>, 
    quantity: number = 1
  ): Promise<{success: boolean; message?: string}> => {
    try {
      setSyncing(true);
      
      const payload: any = {
        product_id: item.productId,
        quantity: quantity
      };
      
      // Add variant ID if exists
      if (item.variantId) {
        payload.variant_id = item.variantId;
      }

      const response = await api.post<APIResponse>(endpoints.addToCart, payload);
      
      if (response.data.success) {
        // Update local state
        setCartData(response.data.data);
        
        // Convert and update local items
        const localItems = response.data.data.items.map(apiToLocalCartItem);
        setItems(localItems);
        
        // Show success message
        Alert.alert('Success', response.data.message || 'Item added to cart');
        
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to add to cart');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
      Alert.alert('Error', errorMessage);
      
      return { success: false, message: errorMessage };
    } finally {
      setSyncing(false);
    }
  };

  // Remove item from cart (API integration)
  const removeItem = async (cartItemId: string): Promise<boolean> => {
    try {
      setSyncing(true);
      
      const response = await api.delete<APIResponse>(
        endpoints.removeCart.replace(':item_id', cartItemId)
      );
      
      if (response.data.success) {
        // Update local state
        setCartData(response.data.data);
        
        // Convert and update local items
        const localItems = response.data.data.items.map(apiToLocalCartItem);
        setItems(localItems);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Update item quantity (API integration)
  const updateQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
    if (quantity < 1) {
      // If quantity is 0, remove the item
      return await removeItem(cartItemId);
    }

    try {
      setSyncing(true);
      
      const response = await api.patch<APIResponse>(
        endpoints.updateCart.replace(':item_id', cartItemId),
        { quantity }
      );
      
      if (response.data.success) {
        // Update local state
        setCartData(response.data.data);
        
        // Convert and update local items
        const localItems = response.data.data.items.map(apiToLocalCartItem);
        setItems(localItems);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Clear cart (API integration)
  const clearCart = async (): Promise<boolean> => {
    try {
      setSyncing(true);
      
      const response = await api.delete<APIResponse>(endpoints.clearCart);
      
      if (response.data.success) {
        // Clear local state
        setCartData(null);
        setItems([]);
        
        Alert.alert('Success', 'Cart cleared successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    return items.some(item => item.productId === productId);
  };

  // Get cart item ID for a product
  const getCartItemId = (productId: string): string | null => {
    const item = items.find(item => item.productId === productId);
    return item ? item.id : null;
  };

  // Move item to saved for later (local only)
  const moveToSaved = (id: string) => {
    const itemToSave = items.find(item => item.id === id);
    if (itemToSave) {
      // Remove from cart first via API
      removeItem(id).then((success) => {
        if (success) {
          // Then add to saved items locally
          setSavedItems(prev => [...prev, { ...itemToSave }]);
          Alert.alert('Success', 'Item moved to saved for later');
        }
      });
    }
  };

  // Restore item from saved to cart
  const restoreFromSaved = async (id: string) => {
    const itemToRestore = savedItems.find(item => item.id === id);
    if (itemToRestore) {
      // Add back to cart via API
      const result = await addItem({
        productId: itemToRestore.productId,
        storeName: itemToRestore.storeName,
        productName: itemToRestore.productName,
        price: itemToRestore.price,
        originalPrice: itemToRestore.originalPrice,
        image: itemToRestore.image,
        variantId: itemToRestore.variantId,
        size: itemToRestore.size,
        color: itemToRestore.color,
      }, itemToRestore.quantity);
      
      if (result.success) {
        // Remove from saved items
        removeFromSaved(id);
      }
    }
  };

  // Remove item from saved list
  const removeFromSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate cart total from local items
  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get total number of items in cart
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  // Refresh cart from server
  const refreshCart = async () => {
    await fetchCart();
  };

  // Sync local changes to server (for offline support)
  const syncCartToServer = async () => {
    console.log('Cart is already synced with server');
  };

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        syncing,
        cartData,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        moveToSaved,
        getCartTotal,
        getItemCount,
        savedItems,
        restoreFromSaved,
        removeFromSaved,
        refreshCart,
        syncCartToServer,
        isInCart,
        getCartItemId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};