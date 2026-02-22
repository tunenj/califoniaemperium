// context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { Alert } from 'react-native';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { useAuth } from './AuthContext';

/* ============================
   API TYPES
============================ */
interface APIProduct {
  id: string;
  name: string;
  brand_name: string | null;
  price: string;
  compare_at_price: string | null;
  main_image: string | null;
}

interface APICartItem {
  id: string;
  product: APIProduct;
  variant: any;
  quantity: number;
  price: string;
}

interface APICart {
  id: string;
  items: APICartItem[];
}

interface APIResponse {
  success: boolean;
  message: string;
  data: APICart;
}

// Shipping types
interface ShippingOption {
  logistics_name: string;
  freight: string;
  estimated_delivery: string;
}

interface ShippingAddress {
  country: string;
  state: string;
  city: string;
  postal_code: string;
}

/* ============================
   LOCAL TYPES
============================ */
type CartItem = {
  id: string;
  productId: string;
  storeName: string;
  productName: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: any;
  variantId?: string;
};

type CartContextType = {
  // Cart items
  items: CartItem[];
  loading: boolean;
  syncing: boolean;
  addItem: (
    item: Omit<CartItem, 'quantity' | 'id'>,
    quantity?: number
  ) => Promise<{ success: boolean }>;
  removeItem: (id: string) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getCartTotal: () => number;
  getItemCount: () => number;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string, variantId?: string) => boolean;
  getCartItemId: (productId: string, variantId?: string) => string | null;
  
  // Shipping
  shippingAddress: ShippingAddress;
  setShippingAddress: (address: ShippingAddress) => void;
  shippingOptions: ShippingOption[];
  setShippingOptions: (options: ShippingOption[]) => void;
  selectedShipping: ShippingOption | null;
  setSelectedShipping: (option: ShippingOption | null) => void;
  shippingCost: number;
  getCartTotalWithShipping: () => number;
  clearShipping: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ============================
   PROVIDER
============================ */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Shipping state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    country: '',
    state: '',
    city: '',
    postal_code: '',
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  const { isAuthenticated } = useAuth();

  /* ============================
     API -> LOCAL CONVERSION
  ============================ */
  const apiToLocalCartItem = (apiItem: APICartItem): CartItem => ({
    id: apiItem.id,
    productId: apiItem.product.id,
    storeName: apiItem.product.brand_name || 'Store',
    productName: apiItem.product.name,
    price: parseFloat(apiItem.price),
    originalPrice: apiItem.product.compare_at_price
      ? parseFloat(apiItem.product.compare_at_price)
      : parseFloat(apiItem.price),
    quantity: apiItem.quantity,
    image: apiItem.product.main_image,
    variantId: apiItem.variant?.id,
  });

  /* ============================
     FETCH CART
  ============================ */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get<APIResponse>(endpoints.toGetCart);

      if (response.data.success) {
        const localItems =
          response.data.data.items.map(apiToLocalCartItem);

        setItems(localItems);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setItems([]);
      } else {
        console.error('Cart fetch error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ============================
     ADD ITEM
  ============================ */
  const addItem = async (
    item: Omit<CartItem, 'quantity' | 'id'>,
    quantity: number = 1
  ): Promise<{ success: boolean }> => {
    if (!isAuthenticated) {
      Alert.alert('Login required');
      return { success: false };
    }

    try {
      setSyncing(true);

      console.log("🛒 Adding product to cart:", item);

      const payload: any = {
        product_id: item.productId,
        quantity,
      };

      if (item.variantId) {
        payload.variant_id = item.variantId;
      }

      const response = await api.post<APIResponse>(
        endpoints.addToCart,
        payload
      );

      if (response.data.success) {
        console.log("✅ Added to cart:", item.productName);

        // Update immediately
        const localItems =
          response.data.data.items.map(apiToLocalCartItem);

        setItems(localItems);

        // 🔥 Force sync with server
        await fetchCart();

        return { success: true };
      }

      return { success: false };
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to add item');
      return { success: false };
    } finally {
      setSyncing(false);
    }
  };


  /* ============================
     REMOVE ITEM
  ============================ */
  const removeItem = async (id: string) => {
    try {
      setSyncing(true);

      const response = await api.delete<APIResponse>(
        endpoints.removeCart.replace(':item_id', id)
      );

      if (response.data.success) {
        setItems(
          response.data.data.items.map(apiToLocalCartItem)
        );
        return true;
      }

      return false;
    } catch {
      Alert.alert('Remove failed');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  /* ============================
     UPDATE QUANTITY
  ============================ */
  const updateQuantity = async (
    id: string,
    quantity: number
  ) => {
    if (quantity < 1) return removeItem(id);

    try {
      setSyncing(true);

      const response = await api.patch<APIResponse>(
        endpoints.updateCart.replace(':item_id', id),
        { quantity }
      );

      if (response.data.success) {
        setItems(
          response.data.data.items.map(apiToLocalCartItem)
        );
        return true;
      }

      return false;
    } catch {
      Alert.alert('Update failed');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  /* ============================
     CLEAR CART
  ============================ */
  const clearCart = async () => {
    try {
      await api.delete(endpoints.clearCart);
      setItems([]);
      return true;
    } catch {
      Alert.alert('Clear cart failed');
      return false;
    }
  };

  /* ============================
     HELPERS
  ============================ */
  const getCartTotal = () =>
    items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

  const getItemCount = () =>
    items.reduce((sum, item) => sum + item.quantity, 0);

  // FIX: includes variant comparison
  const isInCart = (
    productId: string,
    variantId?: string
  ) =>
    items.some(
      item =>
        item.productId === productId &&
        item.variantId === variantId
    );

  const getCartItemId = (
    productId: string,
    variantId?: string
  ) => {
    const found = items.find(
      item =>
        item.productId === productId &&
        item.variantId === variantId
    );
    return found?.id || null;
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  /* ============================
     SHIPPING HELPERS
  ============================ */
  const shippingCost = selectedShipping ? parseFloat(selectedShipping.freight) : 0;

  const getCartTotalWithShipping = () => {
    return getCartTotal() + shippingCost;
  };

  const clearShipping = () => {
    setSelectedShipping(null);
    setShippingOptions([]);
  };

  return (
    <CartContext.Provider
      value={{
        // Cart
        items,
        loading,
        syncing,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        refreshCart,
        isInCart,
        getCartItemId,
        
        // Shipping
        shippingAddress,
        setShippingAddress,
        shippingOptions,
        setShippingOptions,
        selectedShipping,
        setSelectedShipping,
        shippingCost,
        getCartTotalWithShipping,
        clearShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used in provider');
  }
  return ctx;
};