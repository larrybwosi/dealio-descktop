import { BusinessType, BusinessConfig, businessConfigs, OrderType } from '@/types/business-config';
import { useState } from 'react';

export class BusinessConfigManager {
  private static instance: BusinessConfigManager;
  private currentBusinessType: BusinessType = 'restaurant';
  private customConfigs: Map<string, BusinessConfig> = new Map();
  private readonly STORAGE_KEY = 'restaurant_pos_config';

  private constructor() {
    this.loadFromLocalStorage();
  }

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
    this.saveToLocalStorage();
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
    this.saveToLocalStorage();
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
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Failed to import configuration:', error);
    }
  }

  // Reset to default configuration
  resetToDefaults(): void {
    this.customConfigs.clear();
    this.currentBusinessType = 'restaurant';
    this.saveToLocalStorage();
  }

  // Save configuration to local storage
  private saveToLocalStorage(): void {
    try {
      const configData = {
        currentBusinessType: this.currentBusinessType,
        customConfigs: Array.from(this.customConfigs.entries()),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configData));
    } catch (error) {
      console.error('Failed to save configuration to local storage:', error);
    }
  }

  // Load configuration from local storage
  private loadFromLocalStorage(): void {
    try {
      const storedConfig = localStorage.getItem(this.STORAGE_KEY);
      if (storedConfig) {
        const data = JSON.parse(storedConfig);
        this.currentBusinessType = data.currentBusinessType;
        this.customConfigs = new Map(data.customConfigs);
      }
    } catch (error) {
      console.error('Failed to load configuration from local storage:', error);
    }
  }
}


export function useBusinessConfig() {
  const [configManager] = useState(() => BusinessConfigManager.getInstance());
  const [businessType, setBusinessTypeState] = useState<BusinessType>(configManager.getBusinessType());
  const [config, setConfig] = useState<BusinessConfig>(configManager.getCurrentConfig());

  const setBusinessType = (newBusinessType: BusinessType) => {
    configManager.setBusinessType(newBusinessType);
    setBusinessTypeState(newBusinessType);
    setConfig(configManager.getCurrentConfig());
    // The saveToLocalStorage is now called inside configManager.setBusinessType
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
