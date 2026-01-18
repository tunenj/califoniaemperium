// context/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type CartItem = {
  id: string;
  storeName: string;
  productName: string;
  price: number; // Changed from string to number for calculations
  originalPrice: number;
  quantity: number;
  image: any;
  size?: string;
  color?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  moveToSaved: (id: string) => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  savedItems: CartItem[];
  restoreFromSaved: (id: string) => void;
  removeFromSaved: (id: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);

  // Add item to cart
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear all items from cart
  const clearCart = () => {
    setItems([]);
  };

  // Move item to saved for later
  const moveToSaved = (id: string) => {
    const itemToSave = items.find(item => item.id === id);
    if (itemToSave) {
      setSavedItems(prev => [...prev, itemToSave]);
      removeItem(id);
    }
  };

  // Restore item from saved to cart
  const restoreFromSaved = (id: string) => {
    const itemToRestore = savedItems.find(item => item.id === id);
    if (itemToRestore) {
      addItem(itemToRestore);
      removeFromSaved(id);
    }
  };

  // Remove from saved items
  const removeFromSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate cart total
  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get total number of items in cart
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
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