// types/business-config.ts
export type BusinessType =
  | 'restaurant'
  | 'bookshop'
  | 'hardware'
  | 'supermarket'
  | 'pharmacy'
  | 'electronics'
  | 'clothing'
  | 'cafe'
  | 'retail';

export type OrderType =
  | 'Dine in'
  | 'Takeaway'
  | 'Delivery'
  | 'Pickup'
  | 'In-store'
  | 'Online'
  | 'Curbside'
  | 'Ship to home';

export interface LocationOption {
  id: string;
  label: string;
  description?: string;
}

export interface BusinessConfig {
  businessType: BusinessType;
  name: string;
  orderTypes: OrderType[];
  requiresLocation: boolean;
  locationLabel?: string;
  locationPlaceholder?: string;
  locations?: LocationOption[];
  requiresCustomer: boolean;
  showLoyaltyPoints: boolean;
  defaultDiscount: number;
  taxLabel?: string;
  customFields?: {
    id: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
  paymentButtonText?: string;
  itemQuantityControls: boolean;
  showItemVariants: boolean;
  showItemAdditions: boolean;
}

// Business configurations
export const businessConfigs: Record<BusinessType, BusinessConfig> = {
  restaurant: {
    businessType: 'restaurant',
    name: 'Restaurant',
    orderTypes: ['Dine in', 'Takeaway', 'Delivery'],
    requiresLocation: true,
    locationLabel: 'Table location',
    locationPlaceholder: 'Select table',
    locations: [
      { id: 'table_1a', label: 'Table 1A' },
      { id: 'table_1b', label: 'Table 1B' },
      { id: 'table_2a', label: 'Table 2A' },
      { id: 'table_2b', label: 'Table 2B' },
      { id: 'table_3a', label: 'Table 3A' },
      { id: 'table_3b', label: 'Table 3B' },
      { id: 'table_4a', label: 'Table 4A' },
      { id: 'table_4b', label: 'Table 4B' },
      { id: 'table_5a', label: 'Table 5A' },
    ],
    requiresCustomer: false,
    showLoyaltyPoints: true,
    defaultDiscount: 0.1,
    paymentButtonText: 'Proceed payment',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: true,
  },

  bookshop: {
    businessType: 'bookshop',
    name: 'Bookshop',
    orderTypes: ['In-store', 'Pickup', 'Ship to home'],
    requiresLocation: false,
    requiresCustomer: true,
    showLoyaltyPoints: true,
    defaultDiscount: 0.05,
    customFields: [
      {
        id: 'gift_wrap',
        label: 'Gift wrapping',
        type: 'select',
        required: false,
        options: ['None', 'Standard', 'Premium'],
        placeholder: 'Select gift wrap option',
      },
      {
        id: 'special_instructions',
        label: 'Special instructions',
        type: 'text',
        required: false,
        placeholder: 'Any special handling instructions',
      },
    ],
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: false,
    showItemAdditions: false,
  },

  hardware: {
    businessType: 'hardware',
    name: 'Hardware Store',
    orderTypes: ['In-store', 'Pickup', 'Delivery'],
    requiresLocation: true,
    locationLabel: 'Pickup location',
    locationPlaceholder: 'Select pickup area',
    locations: [
      { id: 'main_counter', label: 'Main Counter' },
      { id: 'lumber_yard', label: 'Lumber Yard' },
      { id: 'tool_rental', label: 'Tool Rental Center' },
      { id: 'garden_center', label: 'Garden Center' },
    ],
    requiresCustomer: false,
    showLoyaltyPoints: false,
    defaultDiscount: 0,
    customFields: [
      {
        id: 'project_type',
        label: 'Project type',
        type: 'select',
        required: false,
        options: ['Home Repair', 'Construction', 'DIY Project', 'Professional Use'],
        placeholder: 'Select project type',
      },
    ],
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: false,
  },

  supermarket: {
    businessType: 'supermarket',
    name: 'Supermarket',
    orderTypes: ['In-store', 'Pickup', 'Delivery', 'Curbside'],
    requiresLocation: true,
    locationLabel: 'Pickup/Delivery location',
    locationPlaceholder: 'Select location',
    locations: [
      { id: 'main_entrance', label: 'Main Entrance' },
      { id: 'grocery_pickup', label: 'Grocery Pickup Area' },
      { id: 'curbside_1', label: 'Curbside Spot 1' },
      { id: 'curbside_2', label: 'Curbside Spot 2' },
      { id: 'curbside_3', label: 'Curbside Spot 3' },
    ],
    requiresCustomer: true,
    showLoyaltyPoints: true,
    defaultDiscount: 0,
    customFields: [
      {
        id: 'delivery_time',
        label: 'Preferred delivery time',
        type: 'select',
        required: false,
        options: ['ASAP', 'Within 2 hours', 'Today evening', 'Tomorrow morning', 'Tomorrow evening'],
        placeholder: 'Select delivery time',
      },
      {
        id: 'special_requests',
        label: 'Special requests',
        type: 'text',
        required: false,
        placeholder: 'Substitutions, ripeness preferences, etc.',
      },
    ],
    paymentButtonText: 'Place order',
    itemQuantityControls: true,
    showItemVariants: false,
    showItemAdditions: false,
  },

  pharmacy: {
    businessType: 'pharmacy',
    name: 'Pharmacy',
    orderTypes: ['In-store', 'Pickup'],
    requiresLocation: false,
    requiresCustomer: true,
    showLoyaltyPoints: false,
    defaultDiscount: 0,
    customFields: [
      {
        id: 'prescription_number',
        label: 'Prescription number',
        type: 'text',
        required: false,
        placeholder: 'Enter prescription number if applicable',
      },
      {
        id: 'insurance_info',
        label: 'Insurance information',
        type: 'text',
        required: false,
        placeholder: 'Insurance details',
      },
    ],
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: false,
    showItemAdditions: false,
  },

  electronics: {
    businessType: 'electronics',
    name: 'Electronics Store',
    orderTypes: ['In-store', 'Pickup', 'Ship to home'],
    requiresLocation: false,
    requiresCustomer: true,
    showLoyaltyPoints: true,
    defaultDiscount: 0.02,
    customFields: [
      {
        id: 'warranty_plan',
        label: 'Extended warranty',
        type: 'select',
        required: false,
        options: ['None', '1 Year Extended', '2 Year Extended', '3 Year Extended'],
        placeholder: 'Select warranty option',
      },
      {
        id: 'installation_service',
        label: 'Installation service',
        type: 'select',
        required: false,
        options: ['None', 'Basic Setup', 'Professional Installation'],
        placeholder: 'Select installation option',
      },
    ],
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: true,
  },

  clothing: {
    businessType: 'clothing',
    name: 'Clothing Store',
    orderTypes: ['In-store', 'Ship to home', 'Pickup'],
    requiresLocation: false,
    requiresCustomer: false,
    showLoyaltyPoints: true,
    defaultDiscount: 0.15,
    customFields: [
      {
        id: 'gift_receipt',
        label: 'Include gift receipt',
        type: 'select',
        required: false,
        options: ['No', 'Yes'],
        placeholder: 'Include gift receipt?',
      },
    ],
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: false,
  },

  cafe: {
    businessType: 'cafe',
    name: 'Cafe',
    orderTypes: ['Dine in', 'Takeaway', 'Pickup'],
    requiresLocation: true,
    locationLabel: 'Table or pickup area',
    locationPlaceholder: 'Select location',
    locations: [
      { id: 'table_1', label: 'Table 1' },
      { id: 'table_2', label: 'Table 2' },
      { id: 'table_3', label: 'Table 3' },
      { id: 'counter_pickup', label: 'Counter Pickup' },
      { id: 'drive_through', label: 'Drive Through' },
    ],
    requiresCustomer: false,
    showLoyaltyPoints: true,
    defaultDiscount: 0,
    customFields: [
      {
        id: 'customer_name',
        label: 'Name for order',
        type: 'text',
        required: true,
        placeholder: 'Enter name for order',
      },
    ],
    paymentButtonText: 'Place order',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: true,
  },

  retail: {
    businessType: 'retail',
    name: 'Retail Store',
    orderTypes: ['In-store', 'Pickup', 'Ship to home'],
    requiresLocation: false,
    requiresCustomer: false,
    showLoyaltyPoints: true,
    defaultDiscount: 0.05,
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: false,
    showItemAdditions: false,
  },
};

// Helper function to get business config
export function getBusinessConfig(businessType: BusinessType): BusinessConfig {
  return businessConfigs[businessType];
}

// Helper function to check if order type requires location for a business
export function requiresLocationForOrderType(businessConfig: BusinessConfig, orderType: OrderType): boolean {
  if (!businessConfig.requiresLocation) return false;

  // Some order types might not require location even if business generally does
  const noLocationRequired = ['Ship to home', 'Online'];
  return !noLocationRequired.includes(orderType);
}
