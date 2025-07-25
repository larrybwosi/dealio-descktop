import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types";
import { customers as initialCustomers } from "@/data/customers";
import {
  PlusCircle,
  Search,
  Edit,
  Star,
  History,
  X,
  Trash2,
} from "lucide-react";
import {
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/lib/api/customers";
import { useToast } from "@/components/ui/use-toast";

interface CustomerManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerManagement({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerManagementProps) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
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

  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer(selectedCustomer?.id || '');

  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
  );

  const handleAddCustomer = () => {
    createCustomer(newCustomer);
    // setCustomers([...customers, createdCustomer]);
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
    setIsAddingCustomer(false);
    toast({
      title: "Success",
      description: "Customer created successfully",
      variant: "default",
    });
  };

  const handleUpdateCustomer = () => {
    if (!selectedCustomer) return;
    updateCustomer(selectedCustomer);
      setSelectedCustomer(null);
  };

  const handleDeleteCustomer = () => {
    if (!customerToDelete) return;
    deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
  };

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  return (
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
            />
          </div>
          <Button onClick={() => setIsAddingCustomer(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
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
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>

      {/* Add Customer Dialog */}
      <Dialog
        open={isAddingCustomer}
        onOpenChange={() => setIsAddingCustomer(false)}
      >
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
            <Button
              variant="outline"
              onClick={() => setIsAddingCustomer(false)}
              disabled={isCreating}
            >
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

      {/* Edit Customer Dialog */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information. Changes will be saved to the
              database.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        value={selectedCustomer.name}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
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
                        value={selectedCustomer.email || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number</Label>
                      <Input
                        id="edit-phone"
                        value={selectedCustomer.phone || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
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
                        value={selectedCustomer.address || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
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
                        value={selectedCustomer.loyaltyPoints || 0}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            loyaltyPoints: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-notes">Notes</Label>
                      <Textarea
                        id="edit-notes"
                        value={selectedCustomer.notes || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
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
                    {selectedCustomer.orderHistory &&
                    selectedCustomer.orderHistory.length > 0 ? (
                      <div className="space-y-1">
                        {selectedCustomer.orderHistory.map((order, idx) => (
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
                                  ...(selectedCustomer.orderHistory || []),
                                ];
                                newHistory.splice(idx, 1);
                                setSelectedCustomer({
                                  ...selectedCustomer,
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
                <Button
                  variant="outline"
                  onClick={() => setSelectedCustomer(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleUpdateCustomer}
                  disabled={isUpdating || !selectedCustomer.name}
                >
                  {isUpdating ? "Updating..." : "Update Customer"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!customerToDelete}
        onOpenChange={() => !isDeleting && setCustomerToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {customerToDelete && (
              <div className="space-y-2">
                <p className="font-medium">{customerToDelete.name}</p>
                <p className="text-sm text-muted-foreground">
                  {customerToDelete.email} • {customerToDelete.phone}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCustomerToDelete(null)}
              disabled={isDeleting}
            >
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
    </Dialog>
  );
}
