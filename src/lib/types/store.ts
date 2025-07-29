import { SellingUnit } from './products';

export interface CartItem {
  variantId: string;
  productName: string;
  productId: string;
  sellingUnitId: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  sellingUnit: SellingUnit | string;
  totalPrice: number;
  brand: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  customerType: "retail" | "wholesale" | "vip";
  loyaltyPoints: number;
  totalSpent: number;
  lastPurchaseDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  preferredPaymentMethod?: string;
  discountPercentage: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isCheckedIn: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  locationId?: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
}

export interface Order {
  id?: string;
  items: CartItem[];
  subtotal: number;
  customerDiscount: number;
  taxAmount: number;
  total: number;
  customer?: Customer;
  paymentMethod?: string;
  status: string;
  paymentStatus: string;
  receiptNumber?: string;
  cashier: string;
  createdAt?: string;
  isOffline?: boolean;
}