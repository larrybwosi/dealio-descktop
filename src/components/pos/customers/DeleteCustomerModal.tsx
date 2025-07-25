// components/customers/DeleteCustomerModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { useDeleteCustomer } from "@/lib/api/customers";

interface DeleteCustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export function DeleteCustomerModal({ customer, onClose }: DeleteCustomerModalProps) {
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

  const handleDeleteCustomer = () => {
    if (!customer) return;
    deleteCustomer(customer.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!customer) return null;

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this customer? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {customer.email} • {customer.phone}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteCustomer}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}