// Complete implementation example
import { useState, useEffect } from 'react';
import { CartDetails } from '@/components/pos/CartDetails';
import { useBusinessConfig, ConfigValidator, businessPresets } from '@/lib/business-config-manager';
import { BusinessType, OrderType } from '@/types/business-config';
import { CartItem, Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ConfigurablePOSSystem() {
  const businessConfig = useBusinessConfig();

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>('In-store');
  const [tableNumber, setTableNumber] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  // Update order type when business type changes
  useEffect(() => {
    const defaultOrderType = businessConfig.getDefaultOrderType();
    if (!businessConfig.isOrderTypeAvailable(selectedOrderType)) {
      setSelectedOrderType(defaultOrderType);
    }
    // Clear location and custom fields when switching business types
    setTableNumber('');
    setCustomFieldValues({});
  }, [businessConfig.businessType]);

  // Cart management functions
  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems(items => items.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item)));
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomFieldValues({});
  };

  const addSampleItem = () => {
    const sampleItems = {
      restaurant: {
        name: 'Grilled Chicken',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400',
      },
      bookshop: {
        name: 'The Great Gatsby',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      },
      hardware: {
        name: 'Hammer',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1503328427499-d92d1ac3d174?w=400',
      },
      supermarket: {
        name: 'Organic Apples',
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400',
      },
      pharmacy: {
        name: 'Vitamin C',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      },
      electronics: {
        name: 'Wireless Headphones',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      },
      clothing: {
        name: 'Cotton T-Shirt',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      },
      cafe: {
        name: 'Cappuccino',
        price: 4.5,
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400',
      },
      retail: {
        name: 'Gift Card',
        price: 25.0,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      },
    };

    const sample = sampleItems[businessConfig.businessType];
    const newItem: CartItem = {
      id: Date.now().toString(),
      name: sample.name,
      price: sample.price,
      quantity: 1,
      image: sample.image,
      variant: businessConfig.config.showItemVariants ? 'Standard' : undefined,
      addition: businessConfig.config.showItemAdditions ? 'None' : undefined,
    };

    setCartItems(prev => [...prev, newItem]);
    toast({
      title: 'Item added',
      description: `${sample.name} added to cart`,
    });
  };

  const handleProceedPayment = () => {
    // Validate configuration requirements
    const customerValid = ConfigValidator.validateCustomerRequirement(businessConfig.config, selectedCustomer);

    const fieldsValidation = ConfigValidator.validateRequiredFields(businessConfig.config, customFieldValues);

    if (!customerValid) {
      toast({
        title: 'Customer required',
        description: 'Please select a customer to continue',
        variant: 'destructive',
      });
      return;
    }

    if (!fieldsValidation.isValid) {
      toast({
        title: 'Required fields missing',
        description: `Please fill in: ${fieldsValidation.missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Process payment
    console.log('Processing payment:', {
      businessType: businessConfig.businessType,
      config: businessConfig.config,
      cartItems,
      selectedCustomer,
      selectedOrderType,
      tableNumber,
      customFieldValues,
    });

    toast({
      title: 'Order processed',
      description: `${businessConfig.config.paymentButtonText} completed successfully!`,
    });
  };

  const handleOpenCustomer = () => {
    // Mock customer selection
    const mockCustomers = [
      { id: '1', name: 'John Doe', phone: '+1234567890', loyaltyPoints: 150 },
      { id: '2', name: 'Jane Smith', phone: '+1987654321', loyaltyPoints: 300 },
      { id: '3', name: 'Bob Wilson', phone: '+1122334455', loyaltyPoints: 75 },
    ];

    const randomCustomer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
    setSelectedCustomer(randomCustomer);

    toast({
      title: 'Customer selected',
      description: `Selected ${randomCustomer.name}`,
    });
  };

  const applyPreset = (presetKey: keyof typeof businessPresets) => {
    const preset = businessPresets[presetKey];
    businessConfig.createCustomConfig(preset);
    toast({
      title: 'Preset applied',
      description: `Applied ${preset.name} configuration`,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main content area */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurable POS System</h1>
          <p className="text-gray-600">Adaptable point-of-sale system for any business type</p>
        </div>

        {/* Business Configuration Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Business Configuration
              <Badge variant="outline">{businessConfig.config.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Business Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Business Type</label>
                <Select
                  value={businessConfig.businessType}
                  onValueChange={(value: BusinessType) => businessConfig.setBusinessType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {businessConfig.availableBusinessTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium mb-2">Quick Presets</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => applyPreset('fastFood')}>
                    Fast Food
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyPreset('onlineBookstore')}>
                    Online Store
                  </Button>
                </div>
              </div>

              {/* Configuration Actions */}
              <div>
                <label className="block text-sm font-medium mb-2">Actions</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(businessConfig.exportConfig());
                      toast({ title: 'Copied', description: 'Configuration copied to clipboard' });
                    }}
                  >
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={businessConfig.resetToDefaults}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Configuration Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Order Types:</span>
                <div className="text-gray-600 mt-1">{businessConfig.config.orderTypes.join(', ')}</div>
              </div>
              <div>
                <span className="font-medium">Requires Customer:</span>
                <div className="text-gray-600 mt-1">{businessConfig.config.requiresCustomer ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <span className="font-medium">Location Required:</span>
                <div className="text-gray-600 mt-1">{businessConfig.config.requiresLocation ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <span className="font-medium">Default Discount:</span>
                <div className="text-gray-600 mt-1">{(businessConfig.config.defaultDiscount * 100).toFixed(0)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Area (Demo) */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Product catalog would go here</p>
              <Button onClick={addSampleItem}>Add Sample Item to Cart</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white shadow-lg">
        <CartDetails
          businessType={businessConfig.businessType}
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          clearCart={clearCart}
          onProceedPayment={handleProceedPayment}
          onOpenCustomer={handleOpenCustomer}
          selectedCustomer={selectedCustomer}
          selectedOrderType={selectedOrderType}
          setSelectedOrderType={setSelectedOrderType}
          tableNumber={tableNumber}
          setTableNumber={setTableNumber}
          customFieldValues={customFieldValues}
          setCustomFieldValues={setCustomFieldValues}
        />
      </div>
    </div>
  );
}
