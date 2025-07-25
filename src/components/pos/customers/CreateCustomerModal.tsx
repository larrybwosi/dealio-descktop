// components/customers/CreateCustomerModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types";
import { useCreateCustomer } from "@/lib/api/customers";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCustomerModal({
  isOpen,
  onClose,
}: CreateCustomerModalProps) {
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, "id">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    loyaltyPoints: 0,
    lastVisit: new Date().toISOString().split("T")[0],
    orderHistory: [],
    notes: "",
  });

  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();

  const handleAddCustomer = () => {
    createCustomer(newCustomer, {
      onSuccess: () => {
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          address: "",
          loyaltyPoints: 0,
          lastVisit: new Date().toISOString().split("T")[0],
          orderHistory: [],
          notes: "",
        });
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your system. Fill in the required details
            below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  The customer's full name as it should appear in the system.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newCustomer.email || ""}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Used for receipts and notifications.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={newCustomer.phone || ""}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  For order updates and important notifications.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State"
                  value={newCustomer.address || ""}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      address: e.target.value,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  For delivery and shipping purposes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loyalty">Initial Loyalty Points</Label>
                <Input
                  id="loyalty"
                  type="number"
                  value={newCustomer.loyaltyPoints || 0}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      loyaltyPoints: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Starting loyalty points for this customer.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Special preferences or important information"
                  value={newCustomer.notes || ""}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, notes: e.target.value })
                  }
                  className="min-h-[80px]"
                />
                <p className="text-sm text-muted-foreground">
                  Any additional information about the customer.
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleAddCustomer}
            disabled={isCreating || !newCustomer.name}
          >
            {isCreating ? "Creating..." : "Create Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
