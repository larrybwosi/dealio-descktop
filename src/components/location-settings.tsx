import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Package, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useListLocations } from '@/lib/services/locations';
import { useOrgStore } from '@/lib/tanstack-axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface LocationSettingsProps {
  enableStockTaking: boolean;
  selectedLocation: string;
  onStockTakingToggle: (enabled: boolean) => void;
}

const LocationSettings = ({ enableStockTaking, selectedLocation, onStockTakingToggle }: LocationSettingsProps) => {
  const { data: locations, isLoading } = useListLocations();
  const { set } = useOrgStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Handler for location change
  const onLocationChange = (locationId: string) => {
    set({ locationId });
  };
  console.log('Enable Stock Taking:', enableStockTaking);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-primary" />
                Location & Inventory
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Configure your current location and inventory management settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {/* Location Selection Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Stock Taking Toggle Skeleton */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-60" />
              </div>
            </div>
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-primary" />
                Location & Inventory
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Configure your current location and inventory management settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {/* Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="current-location" className="text-sm">
              Current Location
            </Label>
            <div className="flex gap-2">
              <Select value={selectedLocation} onValueChange={onLocationChange}>
                <SelectTrigger id="current-location" className="flex-1">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                      {location.description && ` - ${location.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setShowCreateModal(true)} className="flex-shrink-0">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stock Taking Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="stock-taking" className="font-normal text-sm">
                  Enable Stock Taking
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Track inventory levels and receive low stock alerts
                </p>
              </div>
            </div>
            <Switch
              id="stock-taking"
              checked={enableStockTaking}
              onCheckedChange={onStockTakingToggle}
              className="h-5 w-9"
            />
          </div>

          {/* Additional stock settings that appear when enabled */}
          {enableStockTaking && (
            <div className="p-3 border rounded-lg bg-muted/30 space-y-3 animate-in fade-in-50">
              <div className="space-y-2">
                <Label htmlFor="low-stock-threshold" className="text-sm">
                  Low Stock Threshold
                </Label>
                <Input id="low-stock-threshold" type="number" min="1" placeholder="e.g., 5" className="h-9" />
                <p className="text-xs text-muted-foreground">Receive alerts when inventory falls below this level</p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-update-stock" className="text-sm font-normal">
                  Auto-update stock after sales
                </Label>
                <Switch id="auto-update-stock" className="h-4 w-7" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Location Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Location
            </DialogTitle>
            <DialogDescription>
              To create a new location, please navigate to the Dashboard section. Location management is available in
              the organization settings panel.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Steps to create a location:</strong>
              </p>
              <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                <li>Go to the Dashboard page</li>
                <li>Click on "Organization Settings"</li>
                <li>Select "Locations" tab</li>
                <li>Click "Add New Location"</li>
              </ol>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // You can add navigation logic here if needed
                  setShowCreateModal(false);
                  // Example: router.push('/dashboard/organization/locations')
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationSettings;
