// Define types for our POS system
import { ReactNode } from 'react';

export type OrderStatus = 'ready-to-serve' | 'on-cooking' | 'cancelled' | 'completed' | 'pending-payment';
export type PaymentMethod = "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "MOBILE_PAYMENT" | "BANK_TRANSFER" | "CHEQUE" | "STORE_CREDIT" | "GIFT_CARD" | "LOYALTY_POINTS" | "ON_ACCOUNT" | "OTHER"


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
    id: string;
    name: string;
    default?: boolean;
    price: number;
    sellingUnits: {id:string}[]
  }[];
  additions?: {
    name: string;
    default?: boolean;
  }[];
}

export interface CartItem extends OrderItem {
  productId: string;
  variantId: string;
  sellingUnitId: string;
  variant?: string;
  addition?: string;
}

export type OrderType = 'Dine in' | 'Takeaway' | 'Delivery';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  locationId:string;
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
  amountPaid?: number;
  change?: number;
  saleNumber?: string
}

export interface InvoiceData {
  order: Order;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantEmail: string;
  qrCodeImage: string;
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


export interface ReceiptConfig {
  // Basic Info
  businessName: string;
  businessTagline: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;

  // Logo
  logoUrl: string;
  logoSize: number;
  logoPosition: 'left' | 'center' | 'right';

  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;

  // Typography
  headerFont: string;
  bodyFont: string;
  headerSize: number;
  bodySize: number;
  titleSize: number;

  // Layout
  width: number;
  padding: number;
  spacing: number;
  borderRadius: number;
  showBorder: boolean;
  borderColor: string;
  showDivider: boolean;
  dividerStyle: 'solid' | 'dashed' | 'dotted';
  dividerWidth: number;

  // Receipt Fields
  showDateTime: boolean;
  showReceiptNumber: boolean;
  showOrderType: boolean;
  showCustomerInfo: boolean;
  showCashier: boolean;
  showTax: boolean;
  showDiscount: boolean;
  showPaymentMethod: boolean;
  showAmountReceived: boolean;
  showChange: boolean;
  showQRCode: boolean;
  showPromoCode: boolean;
  showSpecialInstructions: boolean;
  showOrderNotes: boolean;

  // Sections
  showHeader: boolean;
  showItemsSection: boolean;
  showTotalsSection: boolean;
  showPaymentSection: boolean;
  showFooter: boolean;

  // Text Content
  receiptTitle: string;
  thankYouMessage: string;
  footerText: string;
  qrCodeText: string;
  promoCodeText: string;
  notesTitle: string;
  instructionsTitle: string;

  // Paper Style
  paperType: 'thermal' | 'standard';
  showPerforation: boolean;
}


export interface PaymentData {
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'card' | 'mobile';
  amountPaid: number;
  change: number;
}

export interface OrganizationData {
  name: string;
  tagline?: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
}
