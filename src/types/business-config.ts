// types/business-config.ts
import { User, Clock, Package, Info, Box, Truck, Book, Gift } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  options?: Record<string, string>;
  notes?: string;
}

export interface OrderDetails {
  [key: string]: string | number | boolean | undefined;
}

export interface OrderQueue {
  customerName?: string;
  datetime: string;
  tableNumber?: string;
  items: Array<OrderItem>;
  status: string;
  details?: OrderDetails;
}

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
  [key: string]: string | undefined;
}

export interface QueueCardField {
  key: keyof OrderQueue;
  icon: LucideIcon;
  label?: string; // Optional suffix label like 'items'
  //eslint-disable-next-line
  [key: string]: any;
}

export interface OrderDetailsField {
  key: keyof OrderQueue | string; // Allow for keys from a nested 'details' object
  label: string;
  isBadge?: boolean; // To render the status as a badge
}

export interface CartField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'phone' | 'email' | 'address';
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number;
  validation?: string; // Regex pattern for validation
  errorMessage?: string;
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
  cartFields?: CartField[];
  currency?: string; // Default currency code
  taxRate?: number; // Default tax rate percentage
  enableDiscounts?: boolean;
  paymentMethods?: string[]; // e.g. ['Cash', 'Credit Card', 'Mobile Payment']
  showOrderQueue?: boolean;
  showQuickActions?: boolean;
  showCategories?: boolean;
  customFields?: {
    id: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
  queueCardDisplay: QueueCardField[];
  orderDetailsSpec: OrderDetailsField[];
  paymentButtonText?: string;
  itemQuantityControls: boolean;
  showItemVariants: boolean;
  showItemAdditions: boolean;
  selectedLocation?: string;
  enableStockTaking?: boolean;
  lowStockThreshold?: number;
  autoUpdateStock?: boolean;
}

// Business configurations
export const businessConfigs: Record<BusinessType, BusinessConfig> = {
  restaurant: {
    businessType: 'restaurant',
    cartFields: [
      {
        id: 'customer_name',
        label: 'Customer Name',
        type: 'text',
        required: true,
        placeholder: 'Enter customer name'
      },
      {
        id: 'phone',
        label: 'Contact Number',
        type: 'phone',
        required: true,
        placeholder: 'Enter contact number',
        validation: '^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$',
        errorMessage: 'Please enter a valid phone number'
      },
      {
        id: 'special_instructions',
        label: 'Special Instructions',
        type: 'text',
        required: false,
        placeholder: 'Any special instructions for your order?'
      }
    ],
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
    name: 'Restaurant',
    orderTypes: ['Dine in', 'Takeaway', 'Delivery'],
    requiresLocation: true,
    locationLabel: 'Table location',
    locationPlaceholder: 'Select table',
    locations: [
      { id: 'table_1a', label: 'Table 1A', description: 'Window side, 2 seats' },
      { id: 'table_1b', label: 'Table 1B', description: 'Window side, 2 seats' },
      { id: 'table_2a', label: 'Table 2A', description: 'Center area, 4 seats' },
      { id: 'table_2b', label: 'Table 2B', description: 'Center area, 4 seats' },
      { id: 'table_3a', label: 'Table 3A', description: 'Corner booth, 4 seats' },
      { id: 'table_3b', label: 'Table 3B', description: 'Corner booth, 4 seats' },
      { id: 'table_4a', label: 'Table 4A', description: 'Large table, 6 seats' },
      { id: 'table_4b', label: 'Table 4B', description: 'Large table, 6 seats' },
      { id: 'table_5a', label: 'Table 5A', description: 'Private dining, 8 seats' },
      { id: 'counter_1', label: 'Counter Seat 1', description: 'Bar counter' },
      { id: 'counter_2', label: 'Counter Seat 2', description: 'Bar counter' },
      { id: 'outdoor_1', label: 'Patio Table 1', description: 'Outdoor seating' },
      { id: 'outdoor_2', label: 'Patio Table 2', description: 'Outdoor seating' },
    ],
    requiresCustomer: false,
    showLoyaltyPoints: true,
    defaultDiscount: 0.1,
    customFields: [
      {
        id: 'dietary_requirements',
        label: 'Dietary requirements',
        type: 'select',
        required: false,
        options: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy'],
        placeholder: 'Select dietary requirements',
      },
      {
        id: 'special_occasion',
        label: 'Special occasion',
        type: 'select',
        required: false,
        options: ['None', 'Birthday', 'Anniversary', 'Business dinner', 'Date night'],
        placeholder: 'Is this for a special occasion?',
      },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'tableNumber', label: 'Table/Delivery' },
      { key: 'items', label: 'Items' },
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
    paymentButtonText: 'Proceed payment',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: true,
  },

  bookshop: {
    businessType: 'bookshop',
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
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
        options: ['None', 'Standard', 'Premium', 'Eco-friendly'],
        placeholder: 'Select gift wrap option',
      },
      {
        id: 'gift_message',
        label: 'Gift message',
        type: 'text',
        required: false,
        placeholder: 'Add a personal message (max 100 characters)',
      },
      {
        id: 'book_signing',
        label: 'Book signing request',
        type: 'select',
        required: false,
        options: ['None', 'Author dedication', 'Personalized message'],
        placeholder: 'Request author signing',
      },
      {
        id: 'special_instructions',
        label: 'Special instructions',
        type: 'text',
        required: false,
        placeholder: 'Any special handling instructions',
      },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'items', label: 'Items' },
      { key: 'details.gift_wrap', label: 'Gift Wrapping' }, 
      { key: 'details.gift_message', label: 'Gift Message' }, 
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: false,
    showItemAdditions: false,
  },

  hardware: {
    businessType: 'hardware',
    name: 'Building Materials & Hardware',
    orderTypes: ['In-store', 'Pickup', 'Delivery'],
    requiresLocation: true,
    locationLabel: 'Pickup/Delivery location',
    locationPlaceholder: 'Select pickup or delivery area',
    locations: [
      { id: 'main_counter', label: 'Main Counter', description: 'Small items & payment' },
      { id: 'lumber_yard', label: 'Lumber Yard', description: 'Wood, timber & building materials' },
      { id: 'tool_rental', label: 'Tool Rental Center', description: 'Equipment rental & return' },
      { id: 'garden_center', label: 'Garden Center', description: 'Landscaping & outdoor materials' },
      { id: 'bulk_materials', label: 'Bulk Materials Bay', description: 'Sand, gravel, cement pickup' },
      { id: 'loading_dock', label: 'Loading Dock', description: 'Large orders & delivery' },
      { id: 'contractor_entrance', label: 'Contractor Entrance', description: 'Trade professional pickup' },
    ],
    requiresCustomer: false,
    showLoyaltyPoints: true,
    defaultDiscount: 0.05,
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
    customFields: [
      {
        id: 'project_type',
        label: 'Project type',
        type: 'select',
        required: false,
        options: [
          'Home Renovation',
          'New Construction',
          'Commercial Build',
          'DIY Project',
          'Repair Work',
          'Landscaping',
          'Roofing',
          'Plumbing',
          'Electrical Work',
        ],
        placeholder: 'Select project type',
      },
      {
        id: 'delivery_requirements',
        label: 'Delivery requirements',
        type: 'select',
        required: false,
        options: [
          'None - Pickup only',
          'Standard delivery',
          'Crane/Boom truck required',
          'Forklift access needed',
          'Ground level only',
          'Scheduled delivery',
        ],
        placeholder: 'Select delivery requirements',
      },
      {
        id: 'contractor_account',
        label: 'Contractor account number',
        type: 'text',
        required: false,
        placeholder: 'Enter contractor account number for trade pricing',
      },
      {
        id: 'job_site_address',
        label: 'Job site address',
        type: 'text',
        required: false,
        placeholder: 'Delivery address if different from billing',
      },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'tableNumber', label: 'Pickup/Delivery Location' },
      { key: 'items', label: 'Items' },
      { key: 'details.project_type', label: 'Project Type' }, 
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
    taxLabel: 'Tax (HST/GST)',
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: false,
  },

  supermarket: {
    businessType: 'supermarket',
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'tableNumber', label: 'Location' },
      { key: 'items', label: 'Items' },
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
    name: 'Supermarket',
    orderTypes: ['In-store', 'Pickup', 'Delivery', 'Curbside'],
    requiresLocation: true,
    locationLabel: 'Pickup/Delivery location',
    locationPlaceholder: 'Select location',
    locations: [
      { id: 'main_entrance', label: 'Main Entrance', description: 'Customer service desk' },
      { id: 'grocery_pickup', label: 'Grocery Pickup Area', description: 'Dedicated pickup zone' },
      { id: 'curbside_1', label: 'Curbside Spot 1', description: 'Near main entrance' },
      { id: 'curbside_2', label: 'Curbside Spot 2', description: 'Side parking' },
      { id: 'curbside_3', label: 'Curbside Spot 3', description: 'Side parking' },
      { id: 'pharmacy_pickup', label: 'Pharmacy Pickup', description: 'Prescription orders' },
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
        options: [
          'ASAP (within 2 hours)',
          'Today morning (8AM-12PM)',
          'Today afternoon (12PM-5PM)',
          'Today evening (5PM-9PM)',
          'Tomorrow morning (8AM-12PM)',
          'Tomorrow afternoon (12PM-5PM)',
          'Tomorrow evening (5PM-9PM)',
        ],
        placeholder: 'Select delivery time',
      },
      {
        id: 'substitution_preference',
        label: 'Substitution preference',
        type: 'select',
        required: false,
        options: [
          'Allow substitutions',
          'No substitutions - refund if unavailable',
          'Contact me before substituting',
          'Substitute with cheaper alternatives only',
        ],
        placeholder: 'How should we handle out-of-stock items?',
      },
      {
        id: 'special_requests',
        label: 'Special requests',
        type: 'text',
        required: false,
        placeholder: 'Ripeness preferences, specific brands, etc.',
      },
    ],
    paymentButtonText: 'Place order',
    itemQuantityControls: true,
    showItemVariants: false,
    showItemAdditions: false,
  },

  pharmacy: {
    businessType: 'pharmacy',
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'details.prescription_number', label: 'Prescription #' },
      { key: 'items', label: 'Items' },
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
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
        id: 'insurance_provider',
        label: 'Insurance provider',
        type: 'select',
        required: false,
        options: [
          'No insurance',
          'Blue Cross',
          'Sunlife',
          'Manulife',
          'Great-West Life',
          'Desjardins',
          'Green Shield',
          'Other',
        ],
        placeholder: 'Select insurance provider',
      },
      {
        id: 'pharmacist_consultation',
        label: 'Pharmacist consultation',
        type: 'select',
        required: false,
        options: ['Not required', 'General consultation', 'Medication review', 'Vaccination consultation'],
        placeholder: 'Do you need to speak with a pharmacist?',
      },
    ],
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: false,
    showItemAdditions: false,
  },

  electronics: {
    businessType: 'electronics',
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'items', label: 'Items' },
      { key: 'details.warranty_plan', label: 'Warranty' },
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
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
        options: [
          'None',
          '1 Year Extended (+$49)',
          '2 Year Extended (+$99)',
          '3 Year Extended (+$149)',
          'Premium Care 2 Year (+$199)',
        ],
        placeholder: 'Select warranty option',
      },
      {
        id: 'installation_service',
        label: 'Installation service',
        type: 'select',
        required: false,
        options: [
          'None',
          'Basic Setup (+$50)',
          'Professional Installation (+$150)',
          'Premium Setup & Training (+$250)',
        ],
        placeholder: 'Select installation option',
      },
      {
        id: 'trade_in_device',
        label: 'Trade-in device',
        type: 'text',
        required: false,
        placeholder: 'Describe device for trade-in evaluation',
      },
    ],
    paymentButtonText: 'Complete purchase',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: true,
  },

  clothing: {
    businessType: 'clothing',
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'items', label: 'Items' },
      { key: 'details.alteration_service', label: 'Alterations' },
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
    name: 'Clothing Store',
    orderTypes: ['In-store', 'Ship to home', 'Pickup'],
    requiresLocation: false,
    requiresCustomer: false,
    showLoyaltyPoints: true,
    defaultDiscount: 0.15,
    customFields: [
      {
        id: 'size_consultation',
        label: 'Size consultation needed',
        type: 'select',
        required: false,
        options: ['No', 'Yes - In store', 'Yes - Virtual fitting'],
        placeholder: 'Do you need size assistance?',
      },
      {
        id: 'alteration_service',
        label: 'Alteration service',
        type: 'select',
        required: false,
        options: ['None', 'Hemming (+$15)', 'Basic alterations (+$25)', 'Custom tailoring (quote required)'],
        placeholder: 'Select alteration service',
      },
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
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'tableNumber', label: 'Table/Pickup' },
      { key: 'items', label: 'Items' },
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
    name: 'Cafe',
    orderTypes: ['Dine in', 'Takeaway', 'Pickup'],
    requiresLocation: true,
    locationLabel: 'Table or pickup area',
    locationPlaceholder: 'Select location',
    locations: [
      { id: 'table_1', label: 'Table 1', description: 'Window seat, 2 people' },
      { id: 'table_2', label: 'Table 2', description: 'Corner table, 4 people' },
      { id: 'table_3', label: 'Table 3', description: 'Communal table, 6 people' },
      { id: 'counter_seat_1', label: 'Counter Seat 1', description: 'Bar seating' },
      { id: 'counter_seat_2', label: 'Counter Seat 2', description: 'Bar seating' },
      { id: 'counter_pickup', label: 'Counter Pickup', description: 'Order pickup area' },
      { id: 'drive_through', label: 'Drive Through', description: 'Vehicle pickup' },
      { id: 'outdoor_1', label: 'Patio Table 1', description: 'Outdoor seating' },
      { id: 'outdoor_2', label: 'Patio Table 2', description: 'Outdoor seating' },
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
      {
        id: 'coffee_preference',
        label: 'Coffee strength preference',
        type: 'select',
        required: false,
        options: ['Regular', 'Strong', 'Extra strong', 'Decaf', 'Half-caff'],
        placeholder: 'Select coffee strength',
      },
      {
        id: 'milk_alternative',
        label: 'Milk preference',
        type: 'select',
        required: false,
        options: ['Regular milk', 'Almond milk', 'Oat milk', 'Soy milk', 'Coconut milk', 'No milk'],
        placeholder: 'Select milk type',
      },
    ],
    paymentButtonText: 'Place order',
    itemQuantityControls: true,
    showItemVariants: true,
    showItemAdditions: true,
  },

  retail: {
    businessType: 'retail',
    queueCardDisplay: [
      { key: 'customerName', icon: User, label: 'Customer' },
      { key: 'datetime', icon: Clock, label: '' },
      { key: 'items', icon: Package, label: 'items' },
      { key: 'status', icon: Info, label: '' },
    ],
    orderDetailsSpec: [
      { key: 'customerName', label: 'Customer' },
      { key: 'datetime', label: 'Date & Time' },
      { key: 'items', label: 'Items' },
      { key: 'details.membership_tier', label: 'Membership' },
      { key: 'status', label: 'Order Status', isBadge: true },
    ],
    name: 'Retail Store',
    orderTypes: ['In-store', 'Pickup', 'Ship to home'],
    requiresLocation: false,
    requiresCustomer: false,
    showLoyaltyPoints: true,
    defaultDiscount: 0.05,
    customFields: [
      {
        id: 'membership_tier',
        label: 'Membership tier',
        type: 'select',
        required: false,
        options: ['Regular customer', 'Silver member', 'Gold member', 'Platinum member'],
        placeholder: 'Select membership level',
      },
      {
        id: 'promotional_code',
        label: 'Promotional code',
        type: 'text',
        required: false,
        placeholder: 'Enter promotional or coupon code',
      },
    ],
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

// Helper function to get applicable custom fields based on order type
export function getApplicableCustomFields(businessConfig: BusinessConfig, orderType: OrderType) {
  if (!businessConfig.customFields) return [];

  // Filter custom fields based on order type if needed
  return businessConfig.customFields.filter(field => {
    // Example: delivery-specific fields only show for delivery orders
    if (field.id === 'delivery_time' && !['Delivery'].includes(orderType)) return false;
    if (field.id === 'job_site_address' && orderType !== 'Delivery') return false;
    return true;
  });
}
