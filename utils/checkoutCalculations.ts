import { OrderItem } from "@/types/checkout";

export const calculateSubtotal = (items: OrderItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const calculateTotal = (
  subtotal: number,
  shipping: number,
  discount: number
) => subtotal + shipping - discount;
