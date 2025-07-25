// components/customers/index.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Customer } from "@/types";
import {
  PlusCircle,
  Search,
  Edit,
  Star,
  Trash2,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useListCustomers } from "@/lib/api/customers";
import { CreateCustomerModal } from "./CreateCustomerModal";
import { UpdateCustomerModal } from "./UpdateCustomerModal";
import { DeleteCustomerModal } from "./DeleteCustomerModal";

interface CustomerManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

// Loading Skeleton Component
function CustomerTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Loyalty</TableHead>
          <TableHead>Last Visit</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Empty State Component
function EmptyState({
  hasSearchQuery,
  onAddCustomer,
}: {
  hasSearchQuery: boolean;
  onAddCustomer: () => void;
}) {
  if (hasSearchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No customers found</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          No customers match your search criteria. Try adjusting your search
          terms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Get started by adding your first customer to the system.
      </p>
      <Button onClick={onAddCustomer}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add First Customer
      </Button>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Failed to load customers</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {error.message || "An error occurred while loading customer data."}
      </p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

export function CustomerManagement({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerManagementProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  const {
    data: customers = [],
    isLoading,
    error,
    refetch,
  } = useListCustomers();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
  );

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  const handleAddCustomer = () => {
    setIsAddingCustomer(true);
  };

  const handleRetry = () => {
    refetch();
  };

  const renderContent = () => {
    if (isLoading) {
      return <CustomerTableSkeleton />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={handleRetry} />;
    }

    if (filteredCustomers.length === 0) {
      return (
        <EmptyState
          hasSearchQuery={searchQuery.length > 0}
          onAddCustomer={handleAddCustomer}
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Loyalty</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>
                <div>{customer.email}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.phone}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-1" />
                  {customer.loyaltyPoints}
                </div>
              </TableCell>
              <TableCell>{customer.lastVisit}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    Select
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustomerToDelete(customer)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Customer Management</DialogTitle>
          </DialogHeader>

          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer by name, email or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleAddCustomer} disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </div>

          {error && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load customers. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="overflow-y-auto flex-1 min-h-[400px]">
            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>

      <CreateCustomerModal
        isOpen={isAddingCustomer}
        onClose={() => setIsAddingCustomer(false)}
      />

      <UpdateCustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <DeleteCustomerModal
        customer={customerToDelete}
        onClose={() => setCustomerToDelete(null)}
      />
    </>
  );
}
