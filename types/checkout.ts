export interface OrderItem {
  id: string;
  store: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  billingAddress: string;
  country: string;
  city: string;
  deliveryOption: string;
}
