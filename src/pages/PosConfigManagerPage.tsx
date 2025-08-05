import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

// Icons from lucide-react
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
import { BusinessConfig, BusinessType, LocationOption, OrderType } from '@/types/business-config';
import { useNavigate } from 'react-router';

// --- Enhanced Visual Components ---
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

const orderTypeVisuals: Record<OrderType, { icon: LucideIcon; className: string; description: string }> = {
  'Dine in': {
    icon: UtensilsCrossed,
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/80',
    description: 'Customers eat on premises',
  },
  Takeaway: {
    icon: ShoppingBag,
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 border-sky-200 dark:border-sky-700/80',
    description: 'Customers order and take food to go',
  },
  Delivery: {
    icon: Truck,
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700/80',
    description: 'Orders are delivered to customer addresses',
  },
  Pickup: {
    icon: Package,
    className:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/80',
    description: 'Customers collect orders at a designated location',
  },
  'In-store': {
    icon: Store,
    className:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-700/80',
    description: 'Traditional retail shopping experience',
  },
  Online: {
    icon: Tv,
    className:
      'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-700/80',
    description: 'E-commerce and digital orders',
  },
  Curbside: {
    icon: Car,
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-700/80',
    description: 'Customers receive orders at their vehicle',
  },
  'Ship to home': {
    icon: Home,
    className:
      'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-700/80',
    description: 'Products shipped directly to customers',
  },
};

const OrderTypeBadge = ({ type }: { type: OrderType }) => {
  const visual = orderTypeVisuals[type] || { icon: Info, className: 'bg-gray-100 text-gray-800', description: '' };
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

export default function PosConfigManagerPageV2() {
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
  const navigate = useNavigate()

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

  useEffect(() => {
    setEditableConfig(JSON.parse(JSON.stringify(config)));
  }, [config]);

  useEffect(() => {
    if (editableConfig) {
      setIsDirty(JSON.stringify(config) !== JSON.stringify(editableConfig));
    }
  }, [editableConfig, config]);

  const handleConfigChange = (key: keyof BusinessConfig, value: any) => {
    setEditableConfig(prev => (prev ? { ...prev, [key]: value } : null));
  };

  const handleArrayChange = <T,>(arrayKey: keyof BusinessConfig, index: number, field: keyof T, value: any) => {
    if (!editableConfig) return;
    const currentArray = editableConfig[arrayKey] as T[] | undefined;
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
    const currentArray = editableConfig[arrayKey] as any[] | undefined;
    if (!currentArray) return;
    handleConfigChange(
      arrayKey,
      currentArray.filter((_, i) => i !== index)
    );
  };

  const handleOrderTypeToggle = (orderType: OrderType) => {
    if (!editableConfig) return;
    const currentTypes = editableConfig.orderTypes;
    const newTypes = currentTypes.includes(orderType)
      ? currentTypes.filter(ot => ot !== orderType)
      : [...currentTypes, orderType];
    handleConfigChange('orderTypes', newTypes);
  };

  const handleSaveChanges = () => {
    if (editableConfig) {
      const { businessType, ...overrides } = editableConfig;
      createCustomConfig(overrides);
      toast.success('Configuration Saved!', { description: 'Your new settings have been applied.' });
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
    <TooltipProvider>
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
              description="Core POS behavior and business type."
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

            {/* Payment Methods */}
            <ConfigSectionCard
              icon={CreditCard}
              title="Payment Methods"
              description="Configure accepted payment options."
              badge={<Badge variant="outline">{editableConfig.paymentMethods?.length || 0} methods</Badge>}
            >
              <div className="space-y-3">
                <Label className="text-sm">Enabled Payment Methods</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <Badge
                      key={method}
                      variant={editableConfig.paymentMethods?.includes(method) ? 'default' : 'secondary'}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        const current = editableConfig.paymentMethods || [];
                        const newMethods = current.includes(method)
                          ? current.filter(m => m !== method)
                          : [...current, method];
                        handleConfigChange('paymentMethods', newMethods);
                      }}
                    >
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </ConfigSectionCard>

            {/* Order Types */}
            <ConfigSectionCard
              icon={ListTodo}
              title="Order Types"
              description="Enable or disable order types for your business."
              badge={<Badge variant="outline">{editableConfig.orderTypes.length} active</Badge>}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {ALL_ORDER_TYPES.map(ot => (
                    <OrderTypeBadge key={ot} type={ot} />
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {ALL_ORDER_TYPES.map(ot => (
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
                      <span className="text-xs text-muted-foreground">{orderTypeVisuals[ot]?.description}</span>
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
                          onChange={e => handleArrayChange<LocationOption>('locations', index, 'label', e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Input
                          placeholder="Description"
                          value={loc.description}
                          onChange={e =>
                            handleArrayChange<LocationOption>('locations', index, 'description', e.target.value)
                          }
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
                              onChange={e =>
                                handleArrayChange<CustomFieldType>('customFields', index, 'label', e.target.value)
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={v => handleArrayChange<CustomFieldType>('customFields', index, 'type', v)}
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
                                handleArrayChange<CustomFieldType>(
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
                                handleArrayChange<CustomFieldType>('customFields', index, 'required', v)
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
                                handleArrayChange<CustomFieldType>('customFields', index, 'showInReceipt', v)
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
                      addToArray<CustomFieldType>('customFields', {
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
              description="Configure timeouts and system behaviors."
              badge={<Badge variant="destructive">Advanced</Badge>}
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="order-timeout" className="text-sm">
                    Order Timeout (minutes)
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
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="enable-audit" className="font-normal text-sm">
                    Enable Audit Logging
                  </Label>
                  <Switch
                    id="enable-audit"
                    checked={editableConfig.enableAuditLog}
                    onCheckedChange={v => handleConfigChange('enableAuditLog', v)}
                    className="h-5 w-9"
                  />
                </div>
              </div>
            </ConfigSectionCard>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
