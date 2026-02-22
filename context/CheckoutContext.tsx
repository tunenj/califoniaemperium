// context/CheckoutContext.tsx
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { countries } from '@/data/countries';
import { formatPhoneNumber } from '@/utils/phoneValidation';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { useCart } from './CartContext';

// ✅ Updated ShippingInfo type with all required fields
export interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  billingAddress: string;
  country: string;
  city: string;
  deliveryOption: string;
  state?: string;
  postalCode?: string;
  addressLine2?: string;
  customerNotes?: string;
}

// Interface for cart items
export interface CartItem {
  id: string;
  productId: string;
  storeName: string;
  productName: string;
  price: number;
  originalPrice: number;
  image: string | null;
  quantity: number;
  variantId?: string;
}

// ✅ EXPORT this interface - OrderItem
export interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  vendor: string | null;
}

// ✅ EXPORT this interface - OrderDetail
export interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  items_count?: number;
  items: OrderItem[];
  created_at: string;
  paid_at: string | null;
  can_cancel: boolean;
  customer_notes?: string;
}

// Interface for Order list item
export interface Order {
  id: string;
  order_number: string;
  customer: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total: string;
  items_count: number;
  created_at: string;
  paid_at: string | null;
}

// Rest of your CheckoutContext
interface CheckoutContextType {
  // Shipping & Checkout
  shippingInfo: ShippingInfo;
  setShippingInfo: React.Dispatch<React.SetStateAction<ShippingInfo>>;
  selectedCountry: any;
  setSelectedCountry: any;
  showCountryPicker: boolean;
  setShowCountryPicker: any;
  showDeliveryOptions: boolean;
  setShowDeliveryOptions: any;

  // Order & Cart - Now using CartContext
  orderItems: any[];
  cartItems: CartItem[];
  cartTotal: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;

  // Promo
  promoCode: string;
  setPromoCode: any;

  // Payment
  selectedPayment: string;
  setSelectedPayment: any;
  phoneError: string;

  // ✅ Order State
  orderId: string | null;
  setOrderId: (id: string | null) => void;
  hasActiveOrder: boolean;
  setHasActiveOrder: (active: boolean) => void;
  currentOrder: OrderDetail | null;
  setCurrentOrder: (order: OrderDetail | null) => void;
  refreshCurrentOrder: () => Promise<void>;

  // Misc
  handleCheckout: () => void;
  phoneInputRef: any;
  mappedCountries: any[];
  deliveryOptions: string[];
  formatDisplayPhoneNumber: (phone: string, countryCode: string) => string;

  // Cart actions - Use from CartContext
  clearCart: () => Promise<boolean>;
}

const CheckoutContext = createContext<CheckoutContextType>({} as CheckoutContextType);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ✅ Get cart data from CartContext — now including shipping fields
  const {
    items: cartItems,
    getCartTotal,
    clearCart: clearCartFromContext,
    shippingCost,             // ✅ Real shipping cost selected in cart
    getCartTotalWithShipping, // ✅ Subtotal + shipping
  } = useCart();

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [promoCode, setPromoCode] = useState('');
  const [phoneError] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);

  // ✅ ORDER STATE
  const [orderId, setOrderId] = useState<string | null>(null);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderDetail | null>(null);

  // Country data
  const mappedCountries = countries.map(country => ({
    ...country,
    dialCode: country.code,
    flag:
      country.label.includes('Nigeria')
        ? '🇳🇬'
        : country.label.includes('Ghana')
        ? '🇬🇭'
        : country.label.includes('Kenya')
        ? '🇰🇪'
        : country.label.includes('South Africa')
        ? '🇿🇦'
        : '',
  }));

  const [selectedCountry, setSelectedCountry] = useState(mappedCountries[0]);

  // Shipping info
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    phoneNumber: '',
    billingAddress: '',
    country: selectedCountry.label,
    city: '',
    deliveryOption: 'My Address',
    state: '',
    postalCode: '',
    addressLine2: '',
    customerNotes: '',
  });

  const phoneInputRef = useRef<any>(null);

  // ✅ Order items - Map from cart items for display
  const orderItems = cartItems.map(item => ({
    id: item.id,
    store: item.storeName,
    name: item.productName,
    quantity: item.quantity,
    price: item.price,
  }));

  const deliveryOptions = ['My Address', 'Office', 'Pickup Station', 'Other Location'];

  // ✅ Calculate totals from actual cart items — shipping now included
  const cartTotal = getCartTotal();
  const subtotal = cartTotal;
  const discount = 0;                    // Will be updated when promo code is implemented
  const shipping = shippingCost;         // ✅ Real shipping cost from CartContext
  const total = getCartTotalWithShipping(); // ✅ subtotal + shipping cost

  // Format phone number
  const formatDisplayPhoneNumber = (phone: string, countryCode: string) => {
    if (!phone) return '';
    const cleanCode = countryCode.replace('+', '');
    return formatPhoneNumber(phone, cleanCode);
  };

  // ✅ Clear cart - Use the one from CartContext
  const clearCart = async () => {
    return await clearCartFromContext();
  };

  // ✅ Refresh current order details
  const refreshCurrentOrder = useCallback(async () => {
    if (orderId) {
      try {
        const response = await api.get(endpoints.orderDetails(orderId));
        if (response.data.success && response.data.data) {
          setCurrentOrder(response.data.data);
        }
      } catch (error) {
        console.error('Error refreshing order:', error);
      }
    }
  }, [orderId]);

  const handleCheckout = async () => {
    console.log('Checkout initiated');
  };

  // ✅ Debug: Log cart items and totals to verify they're coming through correctly
  useEffect(() => {
    console.log('🛒 CheckoutContext - Cart Items:', cartItems);
    console.log('📦 CheckoutContext - Subtotal:', subtotal);
    console.log('🚚 CheckoutContext - Shipping Cost:', shipping);
    console.log('💰 CheckoutContext - Total (with shipping):', total);
    console.log('🔢 CheckoutContext - Item Count:', cartItems.length);
  }, [cartItems, subtotal, shipping, total]);

  return (
    <CheckoutContext.Provider
      value={{
        // Shipping
        shippingInfo,
        setShippingInfo,
        selectedCountry,
        setSelectedCountry,
        showCountryPicker,
        setShowCountryPicker,
        showDeliveryOptions,
        setShowDeliveryOptions,

        // Order & Cart - Now using real cart data
        orderItems,
        cartItems,
        cartTotal,
        subtotal,
        discount,
        shipping,   // ✅ Real shipping cost
        total,      // ✅ Total including shipping

        // Promo
        promoCode,
        setPromoCode,

        // Payment
        selectedPayment,
        setSelectedPayment,
        phoneError,

        // ✅ Order State
        orderId,
        setOrderId,
        hasActiveOrder,
        setHasActiveOrder,
        currentOrder,
        setCurrentOrder,
        refreshCurrentOrder,

        // Misc
        handleCheckout,
        phoneInputRef,
        mappedCountries,
        deliveryOptions,
        formatDisplayPhoneNumber,

        // ✅ Cart actions - Now using CartContext
        clearCart,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => useContext(CheckoutContext);