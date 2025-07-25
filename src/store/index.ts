import { create } from "zustand";
import { useMemo } from "react";
import { OrderQueue, OrderStatus, Product, CurrencyType } from "@/types";

interface ProductState {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

interface OrderQueueState {
  selectedStatus: OrderStatus | null;
  setSelectedStatus: (status: OrderStatus | null) => void;
  orderType: "dine-in" | "take-away";
  setOrderType: (type: "dine-in" | "take-away") => void;
  selectedTableNumber: string;
  setSelectedTableNumber: (tableNumber: string) => void;
}

interface CurrencyState {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
}

interface GlobalState extends ProductState, OrderQueueState, CurrencyState {}

export const useStore = create<GlobalState>((set) => ({
  // Product state
  selectedCategory: "All",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Order queue state
  selectedStatus: null,
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  orderType: "dine-in",
  setOrderType: (type) => set({ orderType: type }),
  selectedTableNumber: "",
  setSelectedTableNumber: (tableNumber) =>
    set({ selectedTableNumber: tableNumber }),

  // Currency state
  currency: "USD",
  setCurrency: (currency) => set({ currency: currency }),
}));

// Option 1: Individual selectors (recommended for performance)
export const useSelectedCategory = () =>
  useStore((state) => state.selectedCategory);
export const useSetSelectedCategory = () =>
  useStore((state) => state.setSelectedCategory);
export const useSearchQuery = () => useStore((state) => state.searchQuery);
export const useSetSearchQuery = () =>
  useStore((state) => state.setSearchQuery);

export const useSelectedStatus = () =>
  useStore((state) => state.selectedStatus);
export const useSetSelectedStatus = () =>
  useStore((state) => state.setSelectedStatus);
export const useOrderType = () => useStore((state) => state.orderType);
export const useSetOrderType = () => useStore((state) => state.setOrderType);
export const useSelectedTableNumber = () =>
  useStore((state) => state.selectedTableNumber);
export const useSetSelectedTableNumber = () =>
  useStore((state) => state.setSelectedTableNumber);

export const useCurrency = () => useStore((state) => state.currency);
export const useSetCurrency = () => useStore((state) => state.setCurrency);

export const useProductState = () => {
  const selectedCategory = useStore((state) => state.selectedCategory);
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);
  const searchQuery = useStore((state) => state.searchQuery);
  const setSearchQuery = useStore((state) => state.setSearchQuery);

  return useMemo(
    () => ({
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
    }),
    [selectedCategory, setSelectedCategory, searchQuery, setSearchQuery]
  );
};

export const useOrderQueueState = () => {
  const selectedStatus = useStore((state) => state.selectedStatus);
  const setSelectedStatus = useStore((state) => state.setSelectedStatus);
  const orderType = useStore((state) => state.orderType);
  const setOrderType = useStore((state) => state.setOrderType);
  const selectedTableNumber = useStore((state) => state.selectedTableNumber);
  const setSelectedTableNumber = useStore(
    (state) => state.setSelectedTableNumber
  );

  return useMemo(
    () => ({
      selectedStatus,
      setSelectedStatus,
      orderType,
      setOrderType,
      selectedTableNumber,
      setSelectedTableNumber,
    }),
    [
      selectedStatus,
      setSelectedStatus,
      orderType,
      setOrderType,
      selectedTableNumber,
      setSelectedTableNumber,
    ]
  );
};

export const useCurrencyState = () => {
  const currency = useStore((state) => state.currency);
  const setCurrency = useStore((state) => state.setCurrency);

  return useMemo(
    () => ({
      currency,
      setCurrency,
    }),
    [currency, setCurrency]
  );
};
