import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types';
import { customers as initialCustomers } from '@/data/customers';
import { PlusCircle, Search, Edit, Star, History, X } from 'lucide-react';

interface CustomerManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerManagement({ 
  isOpen, 
  onClose,
  onSelectCustomer
}: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    loyaltyPoints: 0,
    lastVisit: new Date().toISOString().split('T')[0],
    orderHistory: [],
    notes: ''
  });

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const handleAddCustomer = () => {
    const customerId = Date.now().toString();
    const customerToAdd = {
      ...newCustomer,
      id: customerId
    };
    
    setCustomers([...customers, customerToAdd]);
    setNewCustomer({
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      loyaltyPoints: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      orderHistory: [],
      notes: ''
    });
    setIsAddingCustomer(false);
  };

  const handleUpdateCustomer = () => {
    if (!selectedCustomer) return;
    
    setCustomers(
      customers.map(customer => 
        customer.id === selectedCustomer.id ? selectedCustomer : customer
      )
    );
    setSelectedCustomer(null);
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
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div>{customer.email}</div>
                      <div className="text-sm text-muted-foreground">{customer.phone}</div>
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
      <Dialog open={isAddingCustomer} onOpenChange={() => setIsAddingCustomer(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email || ''}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newCustomer.phone || ''}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={newCustomer.address || ''}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newCustomer.notes || ''}
                onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCustomer(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddCustomer}>
              Save Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedCustomer.email || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="edit-phone"
                    value={selectedCustomer.phone || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, phone: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="edit-address"
                    value={selectedCustomer.address || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, address: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-loyalty" className="text-right">
                    Loyalty Points
                  </Label>
                  <Input
                    id="edit-loyalty"
                    type="number"
                    value={selectedCustomer.loyaltyPoints || 0}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, loyaltyPoints: parseInt(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="edit-notes"
                    value={selectedCustomer.notes || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, notes: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-history" className="text-right">
                    Order History
                  </Label>
                  <div className="col-span-3 border rounded-md p-2">
                    <div className="flex items-center mb-2">
                      <History className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Past Orders</span>
                    </div>
                    {selectedCustomer.orderHistory && selectedCustomer.orderHistory.length > 0 ? (
                      <div className="space-y-1">
                        {selectedCustomer.orderHistory.map((order, idx) => (
                          <div key={idx} className="text-sm py-1 px-2 bg-muted rounded flex items-center justify-between">
                            <span>{order}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5"
                              onClick={() => {
                                const newHistory = [...(selectedCustomer.orderHistory || [])];
                                newHistory.splice(idx, 1);
                                setSelectedCustomer({...selectedCustomer, orderHistory: newHistory});
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No order history</div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleUpdateCustomer}>
                  Update Customer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}