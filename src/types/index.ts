// Define types for our POS system
import { ReactNode } from 'react';

export type OrderStatus = 'ready-to-serve' | 'on-cooking' | 'cancelled' | 'completed' | 'pending-payment';

export type PaymentMethod = 'Cash' | 'Mobile Payment' | 'Card' | 'Pending';

export type CurrencyType = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BTC';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
  lastVisit?: string;
  orderHistory?: string[];
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  addition?: string;
  image: string;
}

export interface OrderQueue {
  id: string;
  orderNumber: string;
  customerName: string;
  datetime: string;
  status: OrderStatus;
  items: number;
  tableNumber: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  variants?: {
    name: string;
    default?: boolean;
  }[];
  additions?: {
    name: string;
    default?: boolean;
  }[];
}

export interface CartItem extends OrderItem {
  variant?: string;
  addition?: string;
}

export type OrderType = 'Dine in' | 'Takeaway' | 'Delivery';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customer: Customer | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  orderType: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  tableNumber?: string;
  datetime: string;
  notes?: string;
}

export interface InvoiceData {
  order: Order;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantEmail: string;
  qrCodeUrl: string;
}

export interface IconProps {
  className?: string;
  size?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}