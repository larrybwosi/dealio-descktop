import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderQueue } from '@/types'; // Assuming OrderQueue is defined in your types file

/**
 * Interface for the order store state and its actions.
 */
interface OrderState {
  pendingOrders: Order[];
  addPendingOrder: (order: Order) => void;
  removePendingOrder: (orderId: string) => void;
  clearPendingOrders: () => void;
}

/**
 * Zustand store for managing pending orders.
 *
 * It uses `persist` middleware to save the state to localStorage,
 * allowing the data to persist across browser sessions.
 */
export const useOrderStore = create<OrderState>()(
  persist(
    set => ({
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
    }),
    {
      name: 'pending-orders-storage', // Unique name for the localStorage key
      version: 1, // Optional version for migrations
    }
  )
);
