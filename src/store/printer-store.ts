import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Printer } from '@/types/printer';

interface PrinterStore {
  defaultPrinter: string | null;
  printers: Printer[];
  isLoading: boolean;
  error: string | null;
  setDefaultPrinter: (printerName: string) => void;
  setPrinters: (printers: Printer[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePrinterStore = create<PrinterStore>()(
  persist(
    set => ({
      defaultPrinter: null,
      printers: [],
      isLoading: false,
      error: null,
      setDefaultPrinter: (printerName: string) => set({ defaultPrinter: printerName }),
      setPrinters: (printers: Printer[]) => set({ printers }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'printer-storage',
      partialize: state => ({
        defaultPrinter: state.defaultPrinter,
      }),
    }
  )
);
