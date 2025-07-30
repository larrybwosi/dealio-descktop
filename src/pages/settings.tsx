// src/pages/SettingsPage.tsx

import { useState, useEffect, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { useBusinessConfig } from '@/hooks/use-business-config';
import { BusinessConfig, BusinessType } from '@/types/business-config';

// Import your UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function SettingsPage() {
  const { config, updateConfig, setBusinessType, resetToDefaults, availableBusinessTypes } = useBusinessConfig();
  const [formData, setFormData] = useState<BusinessConfig>(config);

  // Sync local form state when the global config changes
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSwitchChange = (name: keyof BusinessConfig, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: keyof BusinessConfig, value: string) => {
    if (name === 'businessType') {
      setBusinessType(value as BusinessType);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    updateConfig(formData);
    toast.success('Settings Saved!', {
      description: `Configuration for "${formData.name}" has been updated.`,
    });
  };

  const handleReset = () => {
    resetToDefaults();
    toast.info('Settings Reset!', {
      description: `Settings for "${config.name}" have been reset to default.`,
    });
  };

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Business Settings</h1>
            <p className="mt-1 text-gray-500">Customize the POS behavior for your business type.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </header>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select a business type to view or modify its settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Business Type Selector */}
              <div className="w-full sm:w-1/2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={config.businessType} onValueChange={value => handleSelectChange('businessType', value)}>
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select a business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBusinessTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* General Settings Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="paymentButtonText">Payment Button Text</Label>
                  <Input
                    id="paymentButtonText"
                    name="paymentButtonText"
                    value={formData.paymentButtonText}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultDiscount">Default Discount (%)</Label>
                  <Input
                    id="defaultDiscount"
                    name="defaultDiscount"
                    type="number"
                    value={formData.defaultDiscount * 100}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, defaultDiscount: parseFloat(e.target.value) / 100 }))
                    }
                    step="1"
                  />
                </div>
              </div>

              <Separator />

              {/* Toggles / Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="requiresCustomer">Requires Customer</Label>
                  <Switch
                    id="requiresCustomer"
                    checked={formData.requiresCustomer}
                    onCheckedChange={checked => handleSwitchChange('requiresCustomer', checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="requiresLocation">Requires Location</Label>
                  <Switch
                    id="requiresLocation"
                    checked={formData.requiresLocation}
                    onCheckedChange={checked => handleSwitchChange('requiresLocation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="showLoyaltyPoints">Show Loyalty Points</Label>
                  <Switch
                    id="showLoyaltyPoints"
                    checked={formData.showLoyaltyPoints}
                    onCheckedChange={checked => handleSwitchChange('showLoyaltyPoints', checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="itemQuantityControls">Show Quantity Controls</Label>
                  <Switch
                    id="itemQuantityControls"
                    checked={formData.itemQuantityControls}
                    onCheckedChange={checked => handleSwitchChange('itemQuantityControls', checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="showItemVariants">Show Item Variants</Label>
                  <Switch
                    id="showItemVariants"
                    checked={formData.showItemVariants}
                    onCheckedChange={checked => handleSwitchChange('showItemVariants', checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="showItemAdditions">Show Item Additions</Label>
                  <Switch
                    id="showItemAdditions"
                    checked={formData.showItemAdditions}
                    onCheckedChange={checked => handleSwitchChange('showItemAdditions', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
