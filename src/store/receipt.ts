import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReceiptConfig {
  // Basic Info
  businessName: string;
  businessTagline?: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail?: string;
  businessWebsite?: string;
  logoUrl?: string;
  receiptTitle: string;

  // Design
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  headerFont: string;
  bodyFont: string;
  titleSize: number;
  headerSize: number;
  bodySize: number;

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
  logoSize: number;
  logoPosition: 'left' | 'center' | 'right';
  showPerforation: boolean;

  // Content
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
  showOrderNotes: boolean;
  showSpecialInstructions: boolean;

  // Sections
  showHeader: boolean;
  showItemsSection: boolean;
  showTotalsSection: boolean;
  showPaymentSection: boolean;
  showFooter: boolean;

  // Text Content
  thankYouMessage: string;
  footerText: string;
  qrCodeText: string;
  promoCodeText: string;
  notesTitle: string;
  instructionsTitle: string;
}

interface ReceiptConfigStore {
  config: ReceiptConfig;
  updateConfig: (key: keyof ReceiptConfig, value: any) => void;
  resetConfig: () => void;
}

const defaultConfig: ReceiptConfig = {
  // Basic Info
  businessName: 'Your Business Name',
  businessTagline: 'Quality Products & Services',
  businessAddress: '123 Main Street\nCity, State 12345',
  businessPhone: '(555) 123-4567',
  businessEmail: 'contact@yourbusiness.com',
  businessWebsite: 'www.yourbusiness.com',
  logoUrl: '',
  receiptTitle: 'RECEIPT',

  // Design
  primaryColor: '#000000',
  secondaryColor: '#666666',
  backgroundColor: '#ffffff',
  accentColor: '#007bff',
  headerFont: 'Arial',
  bodyFont: 'Arial',
  titleSize: 14,
  headerSize: 10,
  bodySize: 8,

  // Layout
  width: 226.77, // 80mm thermal width
  padding: 8,
  spacing: 4,
  borderRadius: 0,
  showBorder: false,
  borderColor: '#000000',
  showDivider: true,
  dividerStyle: 'solid',
  dividerWidth: 0.5,
  logoSize: 80,
  logoPosition: 'center',
  showPerforation: true,

  // Content
  showDateTime: true,
  showReceiptNumber: true,
  showOrderType: true,
  showCustomerInfo: true,
  showCashier: true,
  showTax: true,
  showDiscount: true,
  showPaymentMethod: true,
  showAmountReceived: true,
  showChange: true,
  showQRCode: true,
  showPromoCode: true,
  showOrderNotes: true,
  showSpecialInstructions: true,

  // Sections
  showHeader: true,
  showItemsSection: true,
  showTotalsSection: true,
  showPaymentSection: true,
  showFooter: true,

  // Text Content
  thankYouMessage: 'Thank you for your business!',
  footerText: 'Keep this receipt for your records',
  qrCodeText: 'Scan for Details',
  promoCodeText: 'Promo Code Applied',
  notesTitle: 'Order Notes',
  instructionsTitle: 'Special Instructions',
};

export const useReceiptConfigStore = create<ReceiptConfigStore>()(
  persist(
    set => ({
      config: defaultConfig,
      updateConfig: (key, value) =>
        set(state => ({
          config: { ...state.config, [key]: value },
        })),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: 'receipt-config', // name for localStorage
    }
  )
);
