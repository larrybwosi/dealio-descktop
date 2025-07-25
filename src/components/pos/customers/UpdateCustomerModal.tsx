// components/customers/UpdateCustomerModal.tsx
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
import { useUpdateCustomer } from "@/lib/api/customers";
import { History, X } from "lucide-react";

interface UpdateCustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export function UpdateCustomerModal({
  customer,
  onClose,
}: UpdateCustomerModalProps) {
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(
    customer
  );

  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer(
    editedCustomer?.id || ""
  );

  const handleUpdateCustomer = () => {
    if (!editedCustomer) return;
    updateCustomer(editedCustomer, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  if (!editedCustomer) return null;

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information. Changes will be saved to the database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editedCustomer.name}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editedCustomer.email || ""}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editedCustomer.phone || ""}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editedCustomer.address || ""}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-loyalty">Loyalty Points</Label>
                <Input
                  id="edit-loyalty"
                  type="number"
                  value={editedCustomer.loyaltyPoints || 0}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      loyaltyPoints: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editedCustomer.notes || ""}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      notes: e.target.value,
                    })
                  }
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Order History</Label>
            <div className="border rounded-md p-2">
              <div className="flex items-center mb-2">
                <History className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Past Orders</span>
              </div>
              {editedCustomer.orderHistory &&
              editedCustomer.orderHistory.length > 0 ? (
                <div className="space-y-1">
                  {editedCustomer.orderHistory.map((order, idx) => (
                    <div
                      key={idx}
                      className="text-sm py-1 px-2 bg-muted rounded flex items-center justify-between"
                    >
                      <span>{order}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                          const newHistory = [
                            ...(editedCustomer.orderHistory || []),
                          ];
                          newHistory.splice(idx, 1);
                          setEditedCustomer({
                            ...editedCustomer,
                            orderHistory: newHistory,
                          });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No order history
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleUpdateCustomer}
            disabled={isUpdating || !editedCustomer.name}
          >
            {isUpdating ? "Updating..." : "Update Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
