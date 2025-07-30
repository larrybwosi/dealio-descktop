import { BusinessType, BusinessConfig, businessConfigs, OrderType } from '@/types/business-config';

export class BusinessConfigManager {
  private static instance: BusinessConfigManager;
  private currentBusinessType: BusinessType = 'restaurant';
  private customConfigs: Map<string, BusinessConfig> = new Map();

  private constructor() {}

  static getInstance(): BusinessConfigManager {
    if (!BusinessConfigManager.instance) {
      BusinessConfigManager.instance = new BusinessConfigManager();
    }
    return BusinessConfigManager.instance;
  }

  // Get current business configuration
  getCurrentConfig(): BusinessConfig {
    const customKey = `custom_${this.currentBusinessType}`;
    return this.customConfigs.get(customKey) || businessConfigs[this.currentBusinessType];
  }

  // Set current business type
  setBusinessType(businessType: BusinessType): void {
    this.currentBusinessType = businessType;
  }

  // Get current business type
  getBusinessType(): BusinessType {
    return this.currentBusinessType;
  }

  // Create a custom business configuration
  createCustomConfig(businessType: BusinessType, overrides: Partial<BusinessConfig>): void {
    const baseConfig = businessConfigs[businessType];
    const customConfig: BusinessConfig = {
      ...baseConfig,
      ...overrides,
      businessType: businessType,
    };

    const customKey = `custom_${businessType}`;
    this.customConfigs.set(customKey, customConfig);
  }

  // Get all available business types
  getAvailableBusinessTypes(): BusinessType[] {
    return Object.keys(businessConfigs) as BusinessType[];
  }

  // Validate if order type is available for current business
  isOrderTypeAvailable(orderType: OrderType): boolean {
    const config = this.getCurrentConfig();
    return config.orderTypes.includes(orderType);
  }

  // Get default order type for current business
  getDefaultOrderType(): OrderType {
    const config = this.getCurrentConfig();
    return config.orderTypes[0];
  }

  // Export configuration for backup/sharing
  exportConfig(): string {
    return JSON.stringify(
      {
        currentBusinessType: this.currentBusinessType,
        customConfigs: Array.from(this.customConfigs.entries()),
      },
      null,
      2
    );
  }

  // Import configuration from backup
  importConfig(configJson: string): void {
    try {
      const data = JSON.parse(configJson);
      this.currentBusinessType = data.currentBusinessType;
      this.customConfigs = new Map(data.customConfigs);
    } catch (error) {
      console.error('Failed to import configuration:', error);
    }
  }

  // Reset to default configuration
  resetToDefaults(): void {
    this.customConfigs.clear();
    this.currentBusinessType = 'restaurant';
  }
}

// React hook for using business configuration
import { useState, useEffect } from 'react';

export function useBusinessConfig() {
  const [configManager] = useState(() => BusinessConfigManager.getInstance());
  const [businessType, setBusinessTypeState] = useState<BusinessType>(configManager.getBusinessType());
  const [config, setConfig] = useState<BusinessConfig>(configManager.getCurrentConfig());

  const setBusinessType = (newBusinessType: BusinessType) => {
    configManager.setBusinessType(newBusinessType);
    setBusinessTypeState(newBusinessType);
    setConfig(configManager.getCurrentConfig());
  };

  const createCustomConfig = (overrides: Partial<BusinessConfig>) => {
    configManager.createCustomConfig(businessType, overrides);
    setConfig(configManager.getCurrentConfig());
  };

  return {
    businessType,
    config,
    setBusinessType,
    createCustomConfig,
    availableBusinessTypes: configManager.getAvailableBusinessTypes(),
    isOrderTypeAvailable: (orderType: OrderType) => configManager.isOrderTypeAvailable(orderType),
    getDefaultOrderType: () => configManager.getDefaultOrderType(),
    exportConfig: () => configManager.exportConfig(),
    importConfig: (configJson: string) => {
      configManager.importConfig(configJson);
      setBusinessTypeState(configManager.getBusinessType());
      setConfig(configManager.getCurrentConfig());
    },
    resetToDefaults: () => {
      configManager.resetToDefaults();
      setBusinessTypeState(configManager.getBusinessType());
      setConfig(configManager.getCurrentConfig());
    },
  };
}

// Configuration validation utilities
export const ConfigValidator = {
  validateOrderType: (orderType: OrderType, config: BusinessConfig): boolean => {
    return config.orderTypes.includes(orderType);
  },

  validateRequiredFields: (
    config: BusinessConfig,
    values: Record<string, string>
  ): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    if (config.customFields) {
      config.customFields.forEach(field => {
        if (field.required && (!values[field.id] || values[field.id].trim() === '')) {
          missingFields.push(field.label);
        }
      });
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  },

  //eslint-disable-next-line
  validateCustomerRequirement: (config: BusinessConfig, customer: any): boolean => {
    return !config.requiresCustomer || customer !== null;
  },
};

// Preset configurations for quick setup
export const businessPresets = {
  // Fast food restaurant
  fastFood: {
    businessType: 'restaurant' as BusinessType,
    name: 'Fast Food Restaurant',
    orderTypes: ['Dine in', 'Takeaway', 'Drive-through'] as OrderType[],
    requiresLocation: true,
    locationLabel: 'Order location',
    locations: [
      { id: 'counter', label: 'Counter' },
      { id: 'drive_through', label: 'Drive Through' },
      { id: 'table_1', label: 'Table 1' },
      { id: 'table_2', label: 'Table 2' },
    ],
    customFields: [
      {
        id: 'customer_name',
        label: 'Name for order',
        type: 'text' as const,
        required: true,
        placeholder: 'Enter name',
      },
    ],
    paymentButtonText: 'Place order',
  },

  // Online bookstore
  onlineBookstore: {
    businessType: 'bookshop' as BusinessType,
    name: 'Online Bookstore',
    orderTypes: ['Ship to home', 'Pickup'] as OrderType[],
    requiresCustomer: true,
    customFields: [
      {
        id: 'shipping_speed',
        label: 'Shipping speed',
        type: 'select' as const,
        required: true,
        options: ['Standard (5-7 days)', 'Express (2-3 days)', 'Overnight'],
        placeholder: 'Select shipping speed',
      },
      {
        id: 'gift_message',
        label: 'Gift message',
        type: 'text' as const,
        required: false,
        placeholder: 'Optional gift message',
      },
    ],
  },

  // Medical pharmacy
  medicalPharmacy: {
    businessType: 'pharmacy' as BusinessType,
    name: 'Medical Pharmacy',
    orderTypes: ['In-store', 'Pickup'] as OrderType[],
    requiresCustomer: true,
    showLoyaltyPoints: false,
    customFields: [
      {
        id: 'prescription_id',
        label: 'Prescription ID',
        type: 'text' as const,
        required: false,
        placeholder: 'Enter prescription number',
      },
      {
        id: 'doctor_name',
        label: 'Prescribing doctor',
        type: 'text' as const,
        required: false,
        placeholder: 'Doctor name',
      },
      {
        id: 'insurance_plan',
        label: 'Insurance plan',
        type: 'select' as const,
        required: false,
        options: ['None', 'Medicare', 'Medicaid', 'Private Insurance'],
        placeholder: 'Select insurance',
      },
    ],
  },
};
