import axios, { AxiosInstance } from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ReactNode } from 'react';
import {
  Customer,
  InventoryLocation,
  MeasurementUnit,
  Order,
  Product,
  ProductVariant,
  ProductVariantStock,
  Sale,
} from '@/prisma/client';

import { isTauri } from "@tauri-apps/api/core";
import { LazyStore } from '@tauri-apps/plugin-store';
import api, { axiosClientInstance } from './axios';


interface OrgState {
  organizationId: string | null;
  memberId: string | null;
  locationId: string | null;
  locationName: string | null;
  address: string | null;
  logo: string | null;
  taxRate: string | null;
  currency: string;
  orgName: string | null;
  plan: string | null;
  set: (state: Partial<OrgState>) => void;
  clear: () => void;
}

const tauriStore = isTauri() ? new LazyStore('.org-storage.dat') : null;
export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      organizationId: null,
      memberId: null,
      locationId: null,
      logo: null,
      taxRate: null,
      currency: "USD",
      address: null,
      locationName: null,
      orgName: null,
      plan: null,
      set: (state) => set(state),
      clear: () =>
        set({
          organizationId: null,
          memberId: null,
          locationId: null,
          logo: null,
          taxRate: null,
          currency: "USD",
          address: null,
          locationName: null,
          orgName: null,
          plan: null,
        }),
    }),
    {
      name: "org-storage",
      storage:
        isTauri() && tauriStore
          ? {
              getItem: async (name: string) => {
                try {
                  const value = await tauriStore.get(name);
                  return value ? JSON.parse(value as string) : null;
                } catch (error) {
                  console.error("Error reading from Tauri store:", error);
                  return null;
                }
              },
              //eslint-disable-next-line
              setItem: async (name: string, value: any) => {
                try {
                  await tauriStore.set(name, JSON.stringify(value));
                  await tauriStore.save();
                } catch (error) {
                  console.error("Error writing to Tauri store:", error);
                }
              },
              removeItem: async (name: string) => {
                try {
                  await tauriStore.delete(name);
                  await tauriStore.save();
                } catch (error) {
                  console.error("Error removing from Tauri store:", error);
                }
              },
            }
          : {
              getItem: (name: string) => {
                const value = localStorage.getItem(name);
                return value ? JSON.parse(value) : null;
              },
              //eslint-disable-next-line
              setItem: (name: string, value: any) =>
                localStorage.setItem(name, JSON.stringify(value)),
              removeItem: (name: string) => localStorage.removeItem(name),
            },
    }
  )
);

type ExtendedProduct = {
  id: string; // Unique identifier (cuid)
  name: string; // Product name
  description: string; // Detailed description of the product
  sku: string; // Unique stock-keeping unit identifier
  barcode: string; // Unique barcode for the product
  categoryId: string; // ID of the associated category
  category: unknown; // Related Category object
  isActive: boolean; // Whether the product is active (default: true)
  imageUrls: string[]; // Array of image URLs for the product
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last updated timestamp
  image?: string;

  // Physical dimensions
  width: number; // Width of the product
  height: number; // Height of the product
  length: number; // Length of the product
  dimensionUnit: MeasurementUnit; // Unit of measurement (e.g., METER, FEET)
  weight: number; // Weight of the product
  weightUnit: MeasurementUnit; // Unit of weight (e.g., WEIGHT_KG, WEIGHT_LB)
  volumetricWeight: number; // Calculated dimensional weight

  // Additional attributes
  brand: string; // Brand name of the product
  rating: number; // Product rating (e.g., 4.5)
  lowStockThreshold: number; // Threshold for low stock alerts
  isNew: boolean; // Whether the product is marked as new (default: false)
  detailedDescription: string; // Extensive description of the product
  tags: string[]; // Array of tags for categorization
  isFeatured: boolean; // Whether the product is featured (default: false)

  defaultLocationId: string; // ID of the default stocking location
  defaultLocation: InventoryLocation; // Related InventoryLocation object

  // Relations
  variants: ProductVariant[] & { stockingUnit: unknown }; // Array of related ProductVariant objects
  variantStock: ProductVariantStock[]; // Array of related ProductVariantStock objects
  suppliers: ProductSupplier[]; // Array of related ProductSupplier objects
};

export interface ProductSupplier {
  id: string;
  supplierId: string;
  productId: string;
  organizationId: string;
}

export interface SalesReportCriteria {
  startDate: string;
  endDate: string;
  locationId?: string;
  productId?: string;
  customerId?: string;
}

export interface SalesReportResponse {
  totalSales: number;
  totalOrders: number;
  items: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface ReceiptResponse {
  id: string;
  orderId: string;
  createdAt: string;
  content: string;
  url: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    message?: string;
    success: boolean;
  };
  error?: string;
}

export interface InvoiceResponse {
  url: string;
}
// Axios client constructor
class ApiClient {
  private axiosInstance: AxiosInstance;
  constructor(baseURL: string) {
    this.axiosInstance = axiosClientInstance;
  }
  // Customers Service
  customers = {
    list: async (organizationId: string): Promise<ApiResponse<Customer[]>> =>
      this.axiosInstance.get(`/${organizationId}/v2/customers`).then(res => res),
    create: async (organizationId: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> =>
      this.axiosInstance
        .post(`/${organizationId}/v2/customers`, data, { headers: { 'Content-Type': 'application/json' } })
        .then(res => res),
    get: async (organizationId: string, customerId: string): Promise<ApiResponse<Customer>> =>
      this.axiosInstance.get(`/${organizationId}/customers/${customerId}`).then(res => res.data),
    update: async (
      organizationId: string,
      customerId: string,
      data: Partial<Customer>
    ): Promise<ApiResponse<Customer>> =>
      this.axiosInstance.patch(`/${organizationId}/customers/${customerId}`, data).then(res => res.data),
    delete: async (organizationId: string, customerId: string): Promise<ApiResponse<void>> =>
      this.axiosInstance.delete(`/${organizationId}/customers/${customerId}`).then(res => res.data),
    orders: {
      list: async (organizationId: string, customerId: string): Promise<ApiResponse<Order[]>> =>
        this.axiosInstance.get(`/${organizationId}/customers/${customerId}/orders`).then(res => res.data),
      create: async (organizationId: string, customerId: string, data: Partial<Order>): Promise<ApiResponse<Order>> =>
        this.axiosInstance.post(`/${organizationId}/customers/${customerId}/orders`, data).then(res => res.data),
    },
  };
  products = {
    list: async (organizationId: string, locationId?: string): Promise<ApiResponse<ExtendedProduct[]>> => {
      return await this.axiosInstance.get(`/${organizationId}/v2/products?locationId=${locationId}`);
    },
    create: (organizationId: string, data: Partial<Product>): Promise<ApiResponse<Product>> =>
      this.axiosInstance.post(`/${organizationId}/products`, data).then(res => res.data),
    get: (organizationId: string, productId: string): Promise<ApiResponse<Product>> =>
      this.axiosInstance.get(`/${organizationId}/products/${productId}`).then(res => res.data),
    update: (organizationId: string, productId: string, data: Partial<Product>): Promise<ApiResponse<Product>> =>
      this.axiosInstance.patch(`/${organizationId}/products/${productId}`, data).then(res => res.data),
    delete: (organizationId: string, productId: string): Promise<ApiResponse<void>> =>
      this.axiosInstance.delete(`/${organizationId}/products/${productId}`).then(res => res.data),
    variants: {
      list: (organizationId: string, productId: string): Promise<ApiResponse<ProductVariant[]>> =>
        this.axiosInstance.get(`/${organizationId}/products/${productId}/variants`).then(res => res.data),
      create: (
        organizationId: string,
        productId: string,
        data: Partial<ProductVariant>
      ): Promise<ApiResponse<ProductVariant>> =>
        this.axiosInstance.post(`/${organizationId}/products/${productId}/variants`, data).then(res => res.data),
      get: (organizationId: string, productId: string, variantId: string): Promise<ApiResponse<ProductVariant>> =>
        this.axiosInstance.get(`/${organizationId}/products/${productId}/variants/${variantId}`).then(res => res.data),
      restock: (organizationId: string, productId: string, variantId: string): Promise<ApiResponse<ProductVariant>> =>
        this.axiosInstance
          .get(`/${organizationId}/products/${productId}/variants/${variantId}/restock`)
          .then(res => res.data),
      update: (
        organizationId: string,
        productId: string,
        variantId: string,
        data: Partial<ProductVariant>
      ): Promise<ApiResponse<ProductVariant>> =>
        this.axiosInstance
          .patch(`/${organizationId}/products/${productId}/variants/${variantId}`, data)
          .then(res => res.data),
      delete: (organizationId: string, productId: string, variantId: string): Promise<ApiResponse<void>> =>
        this.axiosInstance
          .delete(`/${organizationId}/products/${productId}/variants/${variantId}`)
          .then(res => res.data),
    },
  };

  orders = {
    // CRUD Operations
    list: async (organizationId: string): Promise<ApiResponse<Order[]>> =>
      this.axiosInstance.get(`/${organizationId}/orders`).then(res => res.data),
    //
    create: async (organizationId: string, data: unknown): Promise<ApiResponse<Order>> =>
      this.axiosInstance.post(`/${organizationId}/orders`, data).then(res => res.data),

    get: async (organizationId: string, orderId: string): Promise<ApiResponse<unknown>> =>
      this.axiosInstance.get(`/${organizationId}/orders/${orderId}`).then(res => res),
    stats: async (organizationId: string, dateRange?: string): Promise<ApiResponse<Order>> =>
      this.axiosInstance
        .get(`/${organizationId}/orders/stats${dateRange ? `?dateRange=${dateRange}` : ''}`)
        .then(res => res.data),

    update: async (organizationId: string, orderId: string, data: Partial<Order>): Promise<ApiResponse<Order>> =>
      this.axiosInstance.patch(`/${organizationId}/orders/${orderId}`, data).then(res => res.data),

    delete: async (organizationId: string, orderId: string): Promise<ApiResponse<void>> =>
      this.axiosInstance.delete(`/${organizationId}/orders/${orderId}`).then(res => res.data),

    // Invoice Operations
    generateInvoice: async (organizationId: string, orderId: string): Promise<ApiResponse<InvoiceResponse>> =>
      this.axiosInstance.post(`/${organizationId}/orders/${orderId}/invoice`).then(res => res.data),

    getInvoice: async (organizationId: string, orderId: string): Promise<ApiResponse<InvoiceResponse>> =>
      this.axiosInstance.get(`/${organizationId}/orders/${orderId}/invoice`).then(res => res.data),

    // Order-specific operations
    cancel: async (organizationId: string, orderId: string): Promise<ApiResponse<Order>> =>
      this.axiosInstance.post(`/${organizationId}/orders/${orderId}/cancel`).then(res => res.data),
  };

  // Sales Service
  sales = {
    // CRUD Operations
    list: async (organizationId: string): Promise<ApiResponse<Sale[]>> =>
      this.axiosInstance.get(`/${organizationId}/sales`).then(res => res.data),

    create: async (organizationId: string, data: Partial<Sale>): Promise<ApiResponse<Sale>> =>
      this.axiosInstance.post(`/${organizationId}/sales`, data).then(res => res.data),

    get: async (organizationId: string, saleId: string): Promise<ApiResponse<Sale>> =>
      this.axiosInstance.get(`/${organizationId}/sales/${saleId}`).then(res => res.data),
    summary: async (organizationId: string, params: string): Promise<ApiResponse<unknown>> =>
      this.axiosInstance.get(`/${organizationId}/sales/summary?${params}`).then(res => res),

    update: async (organizationId: string, saleId: string, data: Partial<Sale>): Promise<ApiResponse<Sale>> =>
      this.axiosInstance.patch(`/${organizationId}/sales/${saleId}`, data).then(res => res.data),

    delete: async (organizationId: string, saleId: string): Promise<ApiResponse<void>> =>
      this.axiosInstance.delete(`/${organizationId}/sales/${saleId}`).then(res => res.data),

    // Receipt Operations
    generateReceipt: async (organizationId: string, saleId: string): Promise<ApiResponse<ReceiptResponse>> =>
      this.axiosInstance.post(`/${organizationId}/sales/${saleId}/receipt`).then(res => res.data),

    getReceipt: async (organizationId: string, saleId: string): Promise<ApiResponse<ReceiptResponse>> =>
      this.axiosInstance.get(`/${organizationId}/sales/${saleId}/receipt`).then(res => res.data),

    // Reporting Operations
    generateReport: async (
      organizationId: string,
      criteria: SalesReportCriteria
    ): Promise<ApiResponse<SalesReportResponse>> =>
      this.axiosInstance.post(`/${organizationId}/sales/report`, criteria).then(res => res.data),

    export: async (organizationId: string, criteria: SalesReportCriteria): Promise<ApiResponse<Blob>> =>
      this.axiosInstance
        .post(`/${organizationId}/sales/export`, criteria, {
          responseType: 'blob',
        })
        .then(res => res.data),
    sync: (organizationId: string, data: unknown) =>
      this.axiosInstance.post(`/organizations/${organizationId}/sales/sync`, data),

    // Sales-specific operations process
    refund: async (organizationId: string, saleId: string): Promise<ApiResponse<Sale>> =>
      this.axiosInstance.post(`/${organizationId}/sales/${saleId}/refund`).then(res => res.data),
  };
    locations = {
      list: async (organizationId: string): Promise<ApiResponse<InventoryLocation[]>> =>
        this.axiosInstance.get(`/${organizationId}/locations`).then(res => res.data),
      create: async (organizationId: string, data: Partial<InventoryLocation>): Promise<ApiResponse<InventoryLocation>> =>
        this.axiosInstance.post(`/${organizationId}/locations`, data).then(res => res.data),
      get: async (organizationId: string, locationId: string): Promise<ApiResponse<InventoryLocation>> =>
        this.axiosInstance.get(`/${organizationId}/locations/${locationId}`).then(res => res.data),
      update: async (
        organizationId: string,
        locationId: string,
        data: Partial<InventoryLocation>
      ): Promise<ApiResponse<InventoryLocation>> =>
        this.axiosInstance.patch(`/${organizationId}/locations/${locationId}`, data).then(res => res.data),
      delete: async (organizationId: string, locationId: string): Promise<ApiResponse<void>> =>
        this.axiosInstance.delete(`/${organizationId}/locations/${locationId}`).then(res => res.data),
    };

  notifications = {
    list: async (params?: { limit?: number; unreadOnly?: boolean }): Promise<ApiResponse<Notification[]>> =>
      axios.get('/api/users/current/notifications', { params }).then(res => res),

    markAsRead: async (notificationId: string): Promise<ApiResponse<Notification>> =>
      axios.patch(`/api/users/current/notifications/${notificationId}/read`).then(res => res),

    markAllAsRead: async (): Promise<ApiResponse<void>> =>
      axios.patch('/api/users/current/notifications/read-all').then(res => res),

    // Optional: Add more methods as needed
    get: async (notificationId: string): Promise<ApiResponse<Notification>> =>
      axios.get(`/api/users/current/notifications/${notificationId}`).then(res => res),

    delete: async (notificationId: string): Promise<ApiResponse<void>> =>
      axios.delete(`/api/users/current/notifications/${notificationId}`).then(res => res),

    deleteAllRead: async (): Promise<ApiResponse<void>> =>
      axios.delete('/api/users/current/notifications/read').then(res => res),

    deleteAll: async (): Promise<ApiResponse<void>> =>
      axios.delete('/api/users/current/notifications').then(res => res),
  };
}

// Singleton instance
export const apiClient = new ApiClient(
  '/api/organizations'
);


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60 * 12, // 12 hours
      staleTime: 1000 * 60 * 30, // 30 minutes
    },
    mutations: {
      //eslint-disable-next-line
      onSuccess: (data: any) => {
        if (data.meta?.message && data.meta.success) {
          toast.success(data.meta.message);
        }
      },
      onError: (error: unknown) => {
        let errorMessage = 'An unexpected error occurred';

        // Handle different error formats
        if (typeof error === 'string') {
          errorMessage = error; // Direct string error
        } else if (error instanceof Error && error.message) {
          errorMessage = error.message; // Native Error object
        } else if (typeof error === 'object' && error !== null) {
          //eslint-disable-next-line
          const err = error as any; // Use any for compatibility, but safely access properties
          // Prioritize error.response.data.error (string or object with message)
          if (err.response?.data?.error) {
            if (typeof err.response.data.error === 'string') {
              errorMessage = err.response.data.error;
            } else if (typeof err.response.data.error === 'object' && err.response.data.error?.message) {
              errorMessage = err.response.data.error.message;
            }
          }
          // Fallback to error.response.data.message for backward compatibility
          else if (err.response?.data?.message && typeof err.response.data.message === 'string') {
            errorMessage = err.response.data.message;
          }
          // Fallback to generic error.message
          else if (err.message && typeof err.message === 'string') {
            errorMessage = err.message;
          }
        }

        // Log detailed error information for debugging
        console.error('Mutation error:', {
          error,
          extractedMessage: errorMessage,
        });

        // Display the specific error message in the toast
        toast.error(errorMessage, {
          description:
            errorMessage !== 'An unexpected error occurred' ? undefined : 'Please try again or contact support.',
        });
      },
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
