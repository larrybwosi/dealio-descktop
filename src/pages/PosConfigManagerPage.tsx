import { useState, useEffect, useRef, JSX } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  Save,
  Upload,
  RotateCcw,
  Settings,
  Trash2,
  PlusCircle,
  AlertTriangle,
  Wand2,
  Building2,
  ListTodo,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Package,
  Store,
  Tv,
  Shirt,
  Coffee,
  Info,
  Home,
  Car,
  CreditCard,
  Gift,
  Percent,
  Clock,
  User,
  Users,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useBusinessConfig } from '@/lib/business-config-manager';
import { BusinessConfig, BusinessType, LocationOption, OrderType, CartField } from '@/types/business-config';
import { useNavigate } from 'react-router';
import LocationSettings from '@/components/location-settings';
import { useOrgStore } from '@/lib/tanstack-axios';

interface CustomFieldType {
  name: string;
  type: string;
}

const businessTypeVisuals: Record<BusinessType, { icon: LucideIcon; className: string; description: string }> = {
  restaurant: {
    icon: UtensilsCrossed,
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
    description: 'Food service with dine-in, takeaway, or delivery options',
  },
  retail: {
    icon: ShoppingBag,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    description: 'Physical store selling products directly to consumers',
  },
  cafe: {
    icon: Coffee,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    description: 'Coffee shop or casual dining with quick service',
  },
  grocery: {
    icon: Package,
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    description: 'Supermarket or convenience store selling food and household items',
  },
  clothing: {
    icon: Shirt,
    className: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
    description: 'Apparel and fashion retail business',
  },
  electronics: {
    icon: Tv,
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    description: 'Technology and electronic goods retailer',
  },
};

const BusinessTypeBadge = ({ type }: { type: BusinessType }) => {
  const visual = businessTypeVisuals[type] || { icon: Info, className: 'bg-gray-100 text-gray-800', description: '' };
  const Icon = visual.icon;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`py-1.5 px-3 ${visual.className}`}>
          <Icon className="h-4 w-4 mr-2" />
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{visual.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const FeatureBadge = ({ enabled }: { enabled: boolean }) => {
  return (
    <Badge variant={enabled ? 'default' : 'secondary'} className="gap-1.5">
      {enabled ? (
        <>
          <CheckCircle className="h-3.5 w-3.5" />
          Enabled
        </>
      ) : (
        <>
          <XCircle className="h-3.5 w-3.5" />
          Disabled
        </>
      )}
    </Badge>
  );
};

const getOrderTypeVisuals = (businessType: BusinessType): Record<OrderType, { icon: LucideIcon; className: string; description: string }> => {
  const baseVisuals = {
    'Dine in': {
      icon: UtensilsCrossed,
      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/80',
      description: businessType === 'restaurant' 
        ? 'Customers eat in the restaurant' 
        : businessType === 'cafe'
        ? 'Customers enjoy their drinks and snacks in the cafe'
        : 'Customers eat on premises',
    },
    Takeaway: {
      icon: ShoppingBag,
      className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 border-sky-200 dark:border-sky-700/80',
      description: businessType === 'restaurant' || businessType === 'cafe'
        ? 'Order and take food/drinks to go'
        : 'Take purchases to go',
    },
    Delivery: {
      icon: Truck,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700/80',
      description: businessType === 'restaurant'
        ? 'Food delivered to customer address'
        : businessType === 'hardware'
        ? 'Materials delivered to job site'
        : businessType === 'supermarket'
        ? 'Groceries delivered to home'
        : 'Orders delivered to customer address',
    },
    Pickup: {
      icon: Package,
      className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/80',
      description: businessType === 'restaurant' || businessType === 'cafe'
        ? 'Ready for pickup at designated time'
        : businessType === 'hardware'
        ? 'Materials ready for pickup at selected location'
        : businessType === 'pharmacy'
        ? 'Prescription ready for pickup'
        : 'Order ready for collection',
    },
    'In-store': {
      icon: Store,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-700/80',
      description: businessType === 'retail'
        ? 'Traditional retail shopping experience'
        : businessType === 'pharmacy'
        ? 'Purchase and consultation in pharmacy'
        : businessType === 'hardware'
        ? 'Shop and checkout in store'
        : 'In-store purchase',
    },
    Online: {
      icon: Tv,
      className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-700/80',
      description: 'E-commerce and digital orders',
    },
    Curbside: {
      icon: Car,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-700/80',
      description: businessType === 'supermarket'
        ? 'Groceries brought to your vehicle'
        : businessType === 'hardware'
        ? 'Materials loaded into your vehicle'
        : 'Order brought to your vehicle',
    },
    'Ship to home': {
      icon: Home,
      className: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-700/80',
      description: businessType === 'electronics'
        ? 'Products shipped with tracking'
        : businessType === 'clothing'
        ? 'Apparel shipped to your address'
        : 'Items shipped to your address',
    },
  };

  return baseVisuals;
};

const OrderTypeBadge = ({ type, businessType }: { type: OrderType; businessType: BusinessType }) => {
  const visuals = getOrderTypeVisuals(businessType);
  const visual = visuals[type] || { icon: Info, className: 'bg-gray-100 text-gray-800', description: '' };
  const Icon = visual.icon;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`py-1.5 px-3 text-sm font-medium ${visual.className}`}>
          <Icon className="h-4 w-4 mr-1.5" />
          {type}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{visual.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const ConfigSectionCard = ({
  icon,
  title,
  description,
  children,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) => {
  const Icon = icon;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="text-sm mt-1">{description}</CardDescription>
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  const {
    businessType,
    config,
    setBusinessType,
    createCustomConfig,
    availableBusinessTypes,
    exportConfig,
    importConfig,
    resetToDefaults,
  } = useBusinessConfig();

  const [editableConfig, setEditableConfig] = useState<BusinessConfig | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>(config.locations?.[0]?.id || '');
  const navigate = useNavigate();
  const { currency, set: setOrg } = useOrgStore();

  const ALL_ORDER_TYPES: OrderType[] = [
    'Dine in',
    'Takeaway',
    'Delivery',
    'Pickup',
    'In-store',
    'Online',
    'Curbside',
    'Ship to home',
  ];

  const PAYMENT_METHODS = ['Credit Card', 'Cash', 'Mobile Pay', 'Gift Card', 'Bank Transfer'];
  const CUSTOM_FIELD_TYPES = ['text', 'number', 'date', 'select', 'checkbox', 'phone', 'email'];
  const CART_FIELD_TYPES = ['text', 'select', 'number', 'date', 'phone', 'email', 'address'];

  const CartFieldsSection = ({
    cartFields,
    onAddField,
    onRemoveField,
    onUpdateField,
  }: {
    cartFields: CartField[];
    onAddField: (field: CartField) => void;
    onRemoveField: (index: number) => void;
    onUpdateField: (index: number, field: Partial<CartField>) => void;
  }): JSX.Element => {
    return (
      <ConfigSectionCard
        icon={ShoppingBag}
        title="Cart Fields"
        description="Customize fields shown during checkout for each order"
        badge={<Badge variant="outline">{cartFields?.length || 0} fields</Badge>}
      >
        <div className="space-y-4">
          <div className="grid gap-4">
            {cartFields?.map((field, index) => (
              <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`field-label-${index}`}>Field Label</Label>
                      <Input
                        id={`field-label-${index}`}
                        value={field.label}
                        onChange={e => onUpdateField(index, { label: e.target.value })}
                      />
                    </div>
                    <div className="w-40">
                      <Label htmlFor={`field-type-${index}`}>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={value => onUpdateField(index, { type: value as CartField['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CART_FIELD_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`field-placeholder-${index}`}>Placeholder</Label>
                      <Input
                        id={`field-placeholder-${index}`}
                        value={field.placeholder || ''}
                        onChange={e => onUpdateField(index, { placeholder: e.target.value })}
                      />
                    </div>
                    {field.type === 'select' && (
                      <div className="flex-1">
                        <Label htmlFor={`field-options-${index}`}>Options (comma-separated)</Label>
                        <Input
                          id={`field-options-${index}`}
                          value={field.options?.join(', ') || ''}
                          onChange={e =>
                            onUpdateField(index, { options: e.target.value.split(',').map(s => s.trim()) })
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`field-required-${index}`}
                        checked={field.required}
                        onCheckedChange={checked => onUpdateField(index, { required: checked })}
                      />
                      <Label htmlFor={`field-required-${index}`}>Required</Label>
                    </div>
                    {(field.type === 'text' || field.type === 'phone' || field.type === 'email') && (
                      <div className="flex-1">
                        <Label htmlFor={`field-validation-${index}`}>Validation Pattern (regex)</Label>
                        <Input
                          id={`field-validation-${index}`}
                          value={field.validation || ''}
                          onChange={e => onUpdateField(index, { validation: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => onRemoveField(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              onAddField({
                id: `field_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                label: 'New Field',
                type: 'text',
                required: false,
              })
            }
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
      </ConfigSectionCard>
    );
  };

  useEffect(() => {
    // Load the current configuration when the component mounts
    setEditableConfig(JSON.parse(JSON.stringify(config)));
  }, [config]);

  useEffect(() => {
    if (editableConfig) {
      setIsDirty(JSON.stringify(config) !== JSON.stringify(editableConfig));
    }
  }, [editableConfig, config]);

  const handleConfigChange = (key: keyof BusinessConfig, value: unknown) => {
    setEditableConfig(prev => (prev ? { ...prev, [key]: value } : null));
  };

  const handleArrayChange = (arrayKey: keyof BusinessConfig, index: number, field: string, value: unknown) => {
    if (!editableConfig) return;
    const currentArray = editableConfig[arrayKey] as Array<Record<string, unknown>> | undefined;
    if (!currentArray) return;
    const newArray = [...currentArray];
    newArray[index] = { ...newArray[index], [field]: value };
    handleConfigChange(arrayKey, newArray);
  };

  const addToArray = <T,>(arrayKey: keyof BusinessConfig, newItem: T) => {
    if (!editableConfig) return;
    const currentArray = editableConfig[arrayKey] as T[] | undefined;
    handleConfigChange(arrayKey, [...(currentArray || []), newItem]);
  };

  const removeFromArray = (arrayKey: keyof BusinessConfig, index: number) => {
    if (!editableConfig) return;
    const currentArray = editableConfig[arrayKey] as Array<Record<string, unknown>> | undefined;
    if (!currentArray) return;
    handleConfigChange(
      arrayKey,
      currentArray?.filter((_, i) => i !== index)
    );
  };

  const handleOrderTypeToggle = (orderType: OrderType) => {
    if (!editableConfig) return;
    const currentTypes = editableConfig.orderTypes;
    const newTypes = currentTypes.includes(orderType)
      ? currentTypes?.filter(ot => ot !== orderType)
      : [...currentTypes, orderType];
    handleConfigChange('orderTypes', newTypes);
  };

const handleSaveChanges = () => {
  if (editableConfig) {
    const { businessType, ...overrides } = {
      ...editableConfig,
      selectedLocation,
      enableStockTaking: editableConfig.enableStockTaking,
    };
    createCustomConfig(overrides);
    toast.success('Configuration Saved!', {
      description: 'Your new settings have been applied.',
    });
  }
};

  const handleExport = () => {
    const configJson = exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos-config-${businessType}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.info('Exporting configuration...', { description: 'Your file is downloading.' });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result as string;
          JSON.parse(content);
          importConfig(content);
          setImportDialogOpen(false);
          toast.success('Import Successful!', { description: 'The configuration has been loaded.' });
        } catch (error) {
          console.error('Failed to parse config file:', error);
          toast.error('Import Failed', { description: 'The selected file is not a valid configuration file.' });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    resetToDefaults();
    toast.success('Settings Reset', { description: 'The configuration has been reset to defaults.' });
  };

  if (!editableConfig) {
    return <div className="flex items-center justify-center h-screen">Loading configuration...</div>;
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-9 px-0">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">POS Configuration</h1>
            </div>
            <p className="ml-[52px] text-sm text-muted-foreground">
              Manage all settings for your <BusinessTypeBadge type={businessType} /> point of sale system.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" /> Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Configuration</DialogTitle>
                  <DialogDescription>
                    Select a previously exported JSON configuration file to load its settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    accept=".json"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Save className="h-4 w-4 mr-2" /> Export
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently reset all your custom settings to the system defaults.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Reset Settings
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {isDirty && (
          <div className="sticky top-4 z-50 p-3 rounded-lg shadow-lg bg-background border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-sm">You have unsaved changes</h3>
                <p className="text-xs text-muted-foreground">Click save to apply your modifications.</p>
              </div>
            </div>
            <Button size="sm" onClick={handleSaveChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {/* General Settings */}
          <ConfigSectionCard
            icon={Settings}
            title="General Settings"
            description="Core POS behavior, business type, and currency settings."
            badge={<FeatureBadge enabled={true} />}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-type" className="text-sm">
                  Business Type
                </Label>
                <Select value={businessType} onValueChange={value => setBusinessType(value as BusinessType)}>
                  <SelectTrigger id="business-type" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBusinessTypes.map(bt => (
                      <SelectItem key={bt} value={bt} className="capitalize text-sm">
                        {bt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-name" className="text-sm">
                  Business Display Name
                </Label>
                <Input
                  id="business-name"
                  value={editableConfig.name}
                  onChange={e => handleConfigChange('name', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-currency" className="text-sm">
                  Default Currency
                </Label>
                <Select
                  value={currency} // Use the currency from org store
                  onValueChange={newCurrency => {
                    // Update both the org store and local config
                    console.log('Changing currency to:', newCurrency, 'from', currency);
                    setOrg({ currency: newCurrency });
                    console.log('Org store currency updated to:', currency);
                    handleConfigChange('currency', newCurrency);
                  }}
                >
                  <SelectTrigger id="default-currency" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                    <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD ($) - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD ($) - Australian Dollar</SelectItem>
                    <SelectItem value="CHF">CHF (Fr) - Swiss Franc</SelectItem>
                    <SelectItem value="CNY">CNY (¥) - Chinese Yuan</SelectItem>
                    <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                    <SelectItem value="BRL">BRL (R$) - Brazilian Real</SelectItem>
                    <SelectItem value="MXN">MXN ($) - Mexican Peso</SelectItem>
                    <SelectItem value="SGD">SGD ($) - Singapore Dollar</SelectItem>
                    <SelectItem value="NZD">NZD ($) - New Zealand Dollar</SelectItem>
                    <SelectItem value="KSH">KES (KSh) - Kenyan Shilling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="requires-customer" className="font-normal text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Requires Customer
                    </Label>
                  </div>
                  <Switch
                    id="requires-customer"
                    checked={editableConfig.requiresCustomer}
                    onCheckedChange={v => handleConfigChange('requiresCustomer', v)}
                    className="h-5 w-9"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="show-loyalty" className="font-normal text-sm flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Loyalty Points
                    </Label>
                  </div>
                  <Switch
                    id="show-loyalty"
                    checked={editableConfig.showLoyaltyPoints}
                    onCheckedChange={v => handleConfigChange('showLoyaltyPoints', v)}
                    className="h-5 w-9"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="enable-tips" className="font-normal text-sm flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Tips Enabled
                    </Label>
                  </div>
                  <Switch
                    id="enable-tips"
                    checked={editableConfig.enableTips}
                    onCheckedChange={v => handleConfigChange('enableTips', v)}
                    className="h-5 w-9"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="enable-discounts" className="font-normal text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Discounts
                    </Label>
                  </div>
                  <Switch
                    id="enable-discounts"
                    checked={editableConfig.enableDiscounts}
                    onCheckedChange={v => handleConfigChange('enableDiscounts', v)}
                    className="h-5 w-9"
                  />
                </div>
              </div>
            </div>
          </ConfigSectionCard>

          {/* Payment Methods - Updated with full configurability */}
          <ConfigSectionCard
            icon={CreditCard}
            title="Payment Methods"
            description="Configure accepted payment methods with custom settings. Add, modify, or remove payment options."
            badge={<Badge variant="outline">{editableConfig.paymentMethods?.length || 0} methods</Badge>}
          >
            <div className="space-y-4">
              <div className="grid gap-3">
                {editableConfig.paymentMethods?.map((method, index) => (
                  <div key={method.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label htmlFor={`payment-name-${index}`} className="text-sm">
                            Display Name
                          </Label>
                          <Input
                            id={`payment-name-${index}`}
                            value={method.name}
                            onChange={e => handleArrayChange('paymentMethods', index, 'name', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="w-24">
                          <Label htmlFor={`payment-type-${index}`} className="text-sm">
                            Type
                          </Label>
                          <Select
                            value={method.type}
                            onValueChange={v => handleArrayChange('paymentMethods', index, 'type', v)}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="digital">Digital</SelectItem>
                              <SelectItem value="voucher">Voucher</SelectItem>
                              <SelectItem value="bank">Bank</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`payment-enabled-${index}`}
                            checked={method.enabled}
                            onCheckedChange={v => handleArrayChange('paymentMethods', index, 'enabled', v)}
                            className="h-4 w-7"
                          />
                          <Label htmlFor={`payment-enabled-${index}`} className="text-xs">
                            Enabled
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`payment-change-${index}`}
                            checked={method.requiresExactAmount || false}
                            onCheckedChange={v => handleArrayChange('paymentMethods', index, 'requiresExactAmount', v)}
                            className="h-4 w-7"
                          />
                          <Label htmlFor={`payment-change-${index}`} className="text-xs">
                            Exact Amount
                          </Label>
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`payment-fee-${index}`} className="text-xs">
                            Processing Fee (%)
                          </Label>
                          <Input
                            id={`payment-fee-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={method.processingFee || 0}
                            onChange={e =>
                              handleArrayChange(
                                'paymentMethods',
                                index,
                                'processingFee',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                      onClick={() => removeFromArray('paymentMethods', index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  addToArray('paymentMethods', {
                    id: `pm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    name: 'New Payment Method',
                    type: 'other',
                    enabled: true,
                    requiresExactAmount: false,
                    processingFee: 0,
                  })
                }
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>

              {/* Quick enable/disable for common payment methods */}
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm">Quick Toggle Common Methods</Label>
                <div className="flex flex-wrap gap-2">
                  {['Credit Card', 'Cash', 'Mobile Pay', 'Gift Card', 'Bank Transfer'].map(commonMethod => {
                    const isEnabled = editableConfig.paymentMethods?.some(
                      m => m.name.toLowerCase() === commonMethod.toLowerCase() && m.enabled
                    );
                    return (
                      <Badge
                        key={commonMethod}
                        variant={isEnabled ? 'default' : 'secondary'}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          const existingIndex = editableConfig.paymentMethods?.findIndex(
                            m => m.name.toLowerCase() === commonMethod.toLowerCase()
                          );

                          if (existingIndex !== -1 && existingIndex !== undefined) {
                            // Toggle existing method
                            handleArrayChange(
                              'paymentMethods',
                              existingIndex,
                              'enabled',
                              !editableConfig.paymentMethods[existingIndex].enabled
                            );
                          } else {
                            // Add new method
                            addToArray('paymentMethods', {
                              id: `pm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                              name: commonMethod,
                              type:
                                commonMethod === 'Cash'
                                  ? 'cash'
                                  : commonMethod === 'Credit Card'
                                  ? 'card'
                                  : commonMethod === 'Mobile Pay'
                                  ? 'digital'
                                  : commonMethod === 'Gift Card'
                                  ? 'voucher'
                                  : 'bank',
                              enabled: true,
                              requiresExactAmount: commonMethod === 'Cash',
                              processingFee: commonMethod === 'Credit Card' ? 2.5 : 0,
                            });
                          }
                        }}
                      >
                        {commonMethod}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </ConfigSectionCard>
          {/* Component Display */}
          <ConfigSectionCard
            icon={Tv}
            title="Component Display"
            description="Configure which components and cards are visible in your POS interface."
            badge={<Badge variant="outline">Display Settings</Badge>}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="show-order-queue" className="font-normal text-sm flex items-center gap-2">
                      <ListTodo className="h-4 w-4" />
                      Order Queue Card
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Shows pending orders and their status</p>
                  </div>
                  <Switch
                    id="show-order-queue"
                    checked={editableConfig.showOrderQueue}
                    onCheckedChange={v => handleConfigChange('showOrderQueue', v)}
                    className="h-5 w-9"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="show-categories" className="font-normal text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Category Navigation
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Display product categories for quick navigation
                    </p>
                  </div>
                  <Switch
                    id="show-categories"
                    checked={editableConfig.showCategories}
                    onCheckedChange={v => handleConfigChange('showCategories', v)}
                    className="h-5 w-9"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="show-quick-actions" className="font-normal text-sm flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      Quick Action Buttons
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Display shortcuts for common actions</p>
                  </div>
                  <Switch
                    id="show-quick-actions"
                    checked={editableConfig.showQuickActions}
                    onCheckedChange={v => handleConfigChange('showQuickActions', v)}
                    className="h-5 w-9"
                  />
                </div>
              </div>
            </div>
          </ConfigSectionCard>
          {/* Order Types */}
          <ConfigSectionCard
            icon={ListTodo}
            title="Order Types"
            description="Enable or disable order types for your business. Each type affects the order flow and required information."
            badge={<Badge variant="outline">{editableConfig.orderTypes.length} active</Badge>}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {editableConfig.orderTypes.map(ot => (
                  <OrderTypeBadge key={ot} type={ot} businessType={businessType} />
                ))}
              </div>
              <Separator className="my-2" />
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {ALL_ORDER_TYPES?.filter(ot => {
                  // Filter order types based on business type
                  switch (businessType) {
                    case 'restaurant':
                    case 'cafe':
                      return ['Dine in', 'Takeaway', 'Delivery', 'Pickup'].includes(ot);
                    case 'retail':
                    case 'clothing':
                    case 'electronics':
                      return ['In-store', 'Pickup', 'Ship to home', 'Online'].includes(ot);
                    case 'hardware':
                      return ['In-store', 'Pickup', 'Delivery', 'Curbside'].includes(ot);
                    case 'supermarket':
                      return ['In-store', 'Pickup', 'Delivery', 'Curbside', 'Online'].includes(ot);
                    case 'pharmacy':
                      return ['In-store', 'Pickup'].includes(ot);
                    default:
                      return true;
                  }
                }).map(ot => (
                  <div
                    key={ot}
                    className="flex items-center justify-between rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`ot-${ot}`}
                        checked={editableConfig.orderTypes.includes(ot)}
                        onCheckedChange={() => handleOrderTypeToggle(ot)}
                        className="h-4 w-7"
                      />
                      <Label htmlFor={`ot-${ot}`} className="font-normal text-sm cursor-pointer">
                        {ot}
                      </Label>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getOrderTypeVisuals(businessType)[ot]?.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ConfigSectionCard>
          {/* Location Settings */}
          {editableConfig.requiresLocation && (
            <ConfigSectionCard
              icon={Building2}
              title="Location Settings"
              description="Manage tables, pickup spots, or service areas."
              badge={<Badge variant="outline">{editableConfig.locations?.length || 0} locations</Badge>}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="location-label" className="text-sm">
                      Location Field Label
                    </Label>
                    <Input
                      id="location-label"
                      value={editableConfig.locationLabel}
                      onChange={e => handleConfigChange('locationLabel', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location-placeholder" className="text-sm">
                      Location Field Placeholder
                    </Label>
                    <Input
                      id="location-placeholder"
                      value={editableConfig.locationPlaceholder}
                      onChange={e => handleConfigChange('locationPlaceholder', e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                <Separator className="my-2" />
                <Label className="text-sm">Available Locations</Label>
                <div className="space-y-2 rounded-md border max-h-60 overflow-y-auto">
                  {editableConfig.locations?.map((loc, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border-b last:border-b-0">
                      <Input
                        placeholder="Label"
                        value={loc.label}
                        onChange={e => handleArrayChange('locations', index, 'label', e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder="Description"
                        value={loc.description}
                        onChange={e => handleArrayChange('locations', index, 'description', e.target.value)}
                        className="h-8 text-sm text-muted-foreground"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFromArray('locations', index)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8"
                      onClick={() =>
                        addToArray<LocationOption>('locations', {
                          id: `new_loc_${Date.now()}`,
                          label: 'New Location',
                          description: '',
                        })
                      }
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-2" />
                      Add Location
                    </Button>
                  </div>
                </div>
              </div>
            </ConfigSectionCard>
          )}
          {/* Cart Fields */}
          <ConfigSectionCard
            icon={ShoppingBag}
            title="Cart Fields"
            description="Configure fields shown during checkout for each order"
            badge={<Badge variant="outline">{editableConfig.cartFields?.length || 0} fields</Badge>}
          >
            <CartFieldsSection
              cartFields={editableConfig.cartFields || []}
              onAddField={field => addToArray('cartFields', field)}
              onRemoveField={index => removeFromArray('cartFields', index)}
              onUpdateField={(index, updates) => {
                const currentFields = editableConfig.cartFields || [];
                const updatedField = { ...currentFields[index], ...updates };
                handleArrayChange('cartFields', index, Object.keys(updates)[0], Object.values(updates)[0]);
              }}
            />
          </ConfigSectionCard>
          {/* Custom Fields */}
          <ConfigSectionCard
            icon={Wand2}
            title="Custom Fields"
            description="Add custom data fields to the order process."
            badge={<Badge variant="outline">{editableConfig.customFields?.length || 0} fields</Badge>}
          >
            <div className="space-y-3 rounded-md border max-h-96 overflow-y-auto">
              {editableConfig.customFields?.map((field, index) => (
                <div key={index} className="p-3 border-b last:border-b-0 bg-background/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-grow space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <Label className="text-sm">Field Label</Label>
                          <Input
                            value={field.label}
                            onChange={e => handleArrayChange('customFields', index, 'label', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={v => handleArrayChange('customFields', index, 'type', v)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CUSTOM_FIELD_TYPES.map(type => (
                                <SelectItem key={type} value={type} className="text-sm">
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {field.type === 'select' && (
                        <div className="space-y-1">
                          <Label className="text-sm">Options (comma-separated)</Label>
                          <Input
                            value={field.options?.join(', ')}
                            onChange={e =>
                              handleArrayChange(
                                'customFields',
                                index,
                                'options',
                                e.target.value.split(',').map(s => s.trim())
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`cf-req-${index}`}
                            checked={field.required}
                            onCheckedChange={v =>
                              handleArrayChange('customFields', index, 'required', v)
                            }
                            className="h-4 w-7"
                          />
                          <Label htmlFor={`cf-req-${index}`} className="font-normal text-xs">
                            Required
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`cf-show-${index}`}
                            checked={field.showInReceipt}
                            onCheckedChange={v =>
                              handleArrayChange('customFields', index, 'showInReceipt', v)
                            }
                            className="h-4 w-7"
                          />
                          <Label htmlFor={`cf-show-${index}`} className="font-normal text-xs">
                            Show in Receipt
                          </Label>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 mt-5"
                      onClick={() => removeFromArray('customFields', index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="p-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8"
                  onClick={() =>
                    addToArray('customFields', {
                      id: `new_${Date.now()}`,
                      label: 'New Field',
                      type: 'text',
                      required: false,
                      showInReceipt: true,
                    })
                  }
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Add Custom Field
                </Button>
              </div>
            </div>
          </ConfigSectionCard>
          {/* Advanced Settings */}
          <ConfigSectionCard
            icon={Clock}
            title="Advanced Settings"
            description="Configure system behaviors, timeouts, and performance settings that affect the POS interface and operations."
            badge={<Badge variant="destructive">Advanced</Badge>}
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="order-timeout" className="text-sm flex items-center gap-2">
                  Order Timeout (minutes)
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>After this time, incomplete orders will be automatically cancelled</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="order-timeout"
                  type="number"
                  min="1"
                  max="120"
                  value={editableConfig.orderTimeout || 30}
                  onChange={e => handleConfigChange('orderTimeout', parseInt(e.target.value) || 30)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auto-print" className="text-sm">
                  Auto-Print Receipts
                </Label>
                <Select
                  value={editableConfig.autoPrint || 'none'}
                  onValueChange={v => handleConfigChange('autoPrint', v)}
                >
                  <SelectTrigger id="auto-print" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-sm">
                      Disabled
                    </SelectItem>
                    <SelectItem value="all" className="text-sm">
                      All Orders
                    </SelectItem>
                    <SelectItem value="cash" className="text-sm">
                      Cash Payments Only
                    </SelectItem>
                    <SelectItem value="non-cash" className="text-sm">
                      Non-Cash Payments
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ConfigSectionCard>

          <LocationSettings
            enableStockTaking={editableConfig.enableStockTaking}
            selectedLocation={selectedLocation}
            onStockTakingToggle={() => handleConfigChange('enableStockTaking', !editableConfig.enableStockTaking)}
          />
        </div>
      </div>
    </div>
  );
}
