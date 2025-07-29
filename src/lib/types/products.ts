export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  category: { name: string; color: string };
  brand: string;
  rating: number;
  stockLevel: number;
  lowStockThreshold: number;
  variants: ProductVariant[];
  imageUrls: string[];
  isNew: boolean;
  tags?: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  attributes: Record<string, string>;
  retailPrice: number;
  wholesalePrice: number;
  baseUnit: { name: string; symbol: string };
  sellingUnits: SellingUnit[];
  stockingUnit: { name: string; symbol: string };
  stockLevel: number;
  isPopular: boolean;
  isNew: boolean;
}

export interface SellingUnit {
  id: string;
  name: string;
  symbol: string;
  conversionRate: number;
  retailPrice: number;
  wholesalePrice: number;
}