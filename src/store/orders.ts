import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types'; 


interface OrderState {
  pendingOrders: Order[];
  addPendingOrder: (order: Order) => void;
  removePendingOrder: (orderId: string) => void;
  clearPendingOrders: () => void;
}

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
      name: 'pending-orders-storage', 
      version: 1, 
    }
  )
);
