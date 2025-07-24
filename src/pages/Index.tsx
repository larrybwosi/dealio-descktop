import { useState } from 'react';
import { Sidebar } from "@/components/pos/Sidebar";
import { OrderQueues } from "@/components/pos/OrderQueues";
import { ProductList } from "@/components/pos/ProductList";
import { CartDetails } from "@/components/pos/CartDetails";
import { CustomerManagement } from "@/components/pos/CustomerManagement";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { InvoiceModal } from "@/components/pos/InvoiceModal";
import { GlobalCurrencySelector } from "@/components/pos/GlobalCurrencySelector";
import { CartItem, Customer, Order, OrderType, OrderQueue } from '@/types';
// import { useStore } from '@/store';

export default function PosSystem() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>('Dine in');
  const [tableNumber, setTableNumber] = useState<string>('Table 3B');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<OrderQueue | null>(null);
  
  // const { currency, setCurrency } = useStore(state => ({
  //   currency: state.currency,
  //   setCurrency: state.setCurrency
  // }));

  // Add item to cart
  const handleAddToCart = (item: CartItem) => {
    setCartItems(currentItems => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(
        cartItem => cartItem.id === item.id && 
                   cartItem.variant === item.variant && 
                   cartItem.addition === item.addition
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += item.quantity;
        return newItems;
      } else {
        // Add new item to cart
        return [...currentItems, item];
      }
    });
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    setCartItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const handleRemoveItem = (id: string) => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  // Clear all items from cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Open customer management modal
  const handleOpenCustomerModal = () => {
    setIsCustomerModalOpen(true);
  };

  // Select customer
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  // Open payment modal
  const handleOpenPaymentModal = () => {
    if (cartItems.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculate discount (10%)
  const calculateDiscount = () => {
    return calculateSubtotal() * 0.1;
  };

  // Calculate tax (2.5%)
  const calculateTax = () => {
    return calculateSubtotal() * 0.025;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  // Handle payment completion
  const handlePaymentComplete = (order: Order) => {
    setCurrentOrder(order);
    setIsInvoiceModalOpen(true);
    // Clear the cart after successful payment
    if (order.status === 'completed') {
      setCartItems([]);
      // Update customer order history if a customer is selected
      if (selectedCustomer && selectedCustomer.orderHistory) {
        setSelectedCustomer({
          ...selectedCustomer,
          orderHistory: [...selectedCustomer.orderHistory, order.orderNumber],
          lastVisit: new Date().toISOString().split('T')[0]
        });
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-4 h-screen">
          <div className="col-span-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Orders & Products</h2>
                <GlobalCurrencySelector />
              </div>
              <OrderQueues />
              <ProductList onAddToCart={handleAddToCart} />
            </div>
          </div>
          
          <div className="col-span-1 h-full">
            <CartDetails 
              cartItems={cartItems}
              updateQuantity={handleUpdateQuantity}
              removeItem={handleRemoveItem}
              clearCart={handleClearCart}
              onProceedPayment={handleOpenPaymentModal}
              onOpenCustomer={handleOpenCustomerModal}
              selectedCustomer={selectedCustomer}
              selectedOrderType={selectedOrderType}
              setSelectedOrderType={setSelectedOrderType}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
            />
          </div>
        </div>
      </div>

      {/* Customer Management Modal */}
      <CustomerManagement 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cartItems={cartItems}
        subtotal={calculateSubtotal()}
        discount={calculateDiscount()}
        tax={calculateTax()}
        total={calculateTotal()}
        customer={selectedCustomer}
        orderType={selectedOrderType}
        tableNumber={tableNumber}
        onOpenCustomer={handleOpenCustomerModal}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Invoice Modal */}
      {currentOrder && (
        <InvoiceModal 
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          order={currentOrder}
        />
      )}
    </div>
  );
}