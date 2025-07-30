// src/hooks/use-business-config.ts

import { useState, useEffect } from 'react';
import { BusinessConfig, businessConfigs, BusinessType } from '@/types/business-config';

const STORAGE_KEY = 'pos-business-configuration';

/**
 * Manages business configuration state, persisting to Local Storage.
 */
class BusinessConfigManager {
  private static instance: BusinessConfigManager;
  public businessType: BusinessType = 'restaurant';
  public customConfigs: Map<BusinessType, Partial<BusinessConfig>> = new Map();

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): BusinessConfigManager {
    if (!BusinessConfigManager.instance) {
      BusinessConfigManager.instance = new BusinessConfigManager();
    }
    return BusinessConfigManager.instance;
  }

  private saveToLocalStorage(): void {
    try {
      const state = {
        businessType: this.businessType,
        customConfigs: Array.from(this.customConfigs.entries()),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save configuration to local storage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { businessType, customConfigs } = JSON.parse(savedState);
        this.businessType = businessType;
        this.customConfigs = new Map(customConfigs);
      }
    } catch (error) {
      console.error('Failed to load configuration from local storage:', error);
      this.resetToDefaults();
    }
  }

  public getConfig(): BusinessConfig {
    const customConfig = this.customConfigs.get(this.businessType) || {};
    return {
      ...businessConfigs[this.businessType],
      ...customConfig,
    };
  }

  public setBusinessType(type: BusinessType): void {
    this.businessType = type;
    this.saveToLocalStorage();
  }

  public updateConfig(overrides: Partial<BusinessConfig>): void {
    const currentCustomConfig = this.customConfigs.get(this.businessType) || {};
    this.customConfigs.set(this.businessType, { ...currentCustomConfig, ...overrides });
    this.saveToLocalStorage();
  }

  public resetToDefaults(): void {
    this.customConfigs.delete(this.businessType);
    this.saveToLocalStorage();
  }

  public getAvailableBusinessTypes = (): BusinessType[] => Object.keys(businessConfigs) as BusinessType[];
}

/**
 * React hook for accessing and managing business configuration.
 */
export function useBusinessConfig() {
  const manager = BusinessConfigManager.getInstance();
  const [config, setConfig] = useState<BusinessConfig>(manager.getConfig());

  const setBusinessType = (type: BusinessType) => {
    manager.setBusinessType(type);
    setConfig(manager.getConfig());
  };

  const updateConfig = (overrides: Partial<BusinessConfig>) => {
    manager.updateConfig(overrides);
    setConfig(manager.getConfig());
  };

  const resetToDefaults = () => {
    manager.resetToDefaults();
    setConfig(manager.getConfig());
  };

  useEffect(() => {
    // This effect ensures that if the config is updated in another tab,
    // this hook will reflect the changes.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        manager.loadFromLocalStorage();
        setConfig(manager.getConfig());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [manager]);

  return {
    config,
    setBusinessType,
    updateConfig,
    resetToDefaults,
    availableBusinessTypes: manager.getAvailableBusinessTypes(),
  };
}
