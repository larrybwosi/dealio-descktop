// stores/orderStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types';

interface OrderState {
  pendingOrders: Order[];
  addPendingOrder: (order: Order) => void;
  removePendingOrder: (orderId: string) => void;
  clearPendingOrders: () => void;
  getPendingOrders: () => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      pendingOrders: [],
      addPendingOrder: order =>
        set(state => ({
          pendingOrders: [...state.pendingOrders, order],
        })),
      removePendingOrder: orderId =>
        set(state => ({
          pendingOrders: state.pendingOrders.filter(order => order.id !== orderId),
        })),
      clearPendingOrders: () => set({ pendingOrders: [] }),
      getPendingOrders: () => get().pendingOrders,
    }),
    {
      name: 'pending-orders-storage', // unique name for localStorage key
      version: 1, // version number for potential migrations
    }
  )
);
