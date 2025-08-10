import { useState } from 'react';
import { Palette, Download, Eye, Settings, Type, Image as ImageIcon, Layout } from 'lucide-react';
import { toast } from 'sonner';

const ReceiptCustomizer = () => {
  const [config, setConfig] = useState({
    // Basic Info
    businessName: 'Your Business Name',
    businessTagline: 'Quality Products & Services',
    businessAddress: '123 Main Street\nCity, State 12345',
    businessPhone: '(555) 123-4567',
    businessEmail: 'contact@yourbusiness.com',
    businessWebsite: 'www.yourbusiness.com',

    // Logo
    logoUrl: '',
    logoSize: 80,
    logoPosition: 'center',

    // Colors
    primaryColor: '#000000',
    secondaryColor: '#666666',
    backgroundColor: '#ffffff',
    accentColor: '#007bff',

    // Typography
    headerFont: 'Arial',
    bodyFont: 'Arial',
    headerSize: 14,
    bodySize: 8,
    titleSize: 18,

    // Layout
    width: 226.77, // Standard thermal width in points (80mm)
    padding: 8,
    spacing: 4,
    borderRadius: 0,
    showBorder: false,
    borderColor: '#000000',
    showDivider: true,
    dividerStyle: 'solid',
    dividerWidth: 0.5,

    // Receipt Fields
    showDateTime: true,
    showReceiptNumber: true,
    showOrderType: true,
    showCustomerInfo: true,
    showCashier: true,
    showTax: true,
    showDiscount: true,
    showPaymentMethod: true,
    showAmountReceived: true,
    showChange: true,
    showQRCode: true,
    showPromoCode: true,
    showSpecialInstructions: true,
    showOrderNotes: true,

    // Sections
    showHeader: true,
    showItemsSection: true,
    showTotalsSection: true,
    showPaymentSection: true,
    showFooter: true,

    // Text Content
    receiptTitle: 'RECEIPT',
    thankYouMessage: 'Thank you for your business!',
    footerText: 'Keep this receipt for your records',
    qrCodeText: 'Scan for Details',
    promoCodeText: 'Promo Code Applied',
    notesTitle: 'Order Notes',
    instructionsTitle: 'Special Instructions',

    // Paper Style
    paperType: 'thermal',
    showPerforation: true,
  });

  const [activeTab, setActiveTab] = useState('basic');

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'receipt-config.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const saveConfig = async () => {
    try {
      // In a real app, you would call your API here
      console.log('Saving configuration:', config);
      toast.success('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration. Please try again.');
    }
  };

  // Sample data for preview
  const sampleItems = [
    { name: 'Coffee', quantity: 2, price: 4.5, variant: 'Large', addition: 'Extra shot' },
    { name: 'Sandwich', quantity: 1, price: 8.99 },
    { name: 'Cookie', quantity: 3, price: 2.25 },
  ];

  const subtotal = sampleItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discount = subtotal * 0.1;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + tax;
  const amountReceived = 25.0;
  const change = amountReceived - total;
  const paymentMethod = 'Cash';

  const ReceiptPreview = () => (
    <div
      className="receipt-preview mx-auto"
      style={{
        width: `${config.width * 0.75}px`, // Scale down for display
        backgroundColor: config.backgroundColor,
        padding: `${config.padding * 0.75}px`,
        borderRadius: `${config.borderRadius}px`,
        border: config.showBorder ? `1px solid ${config.borderColor}` : 'none',
        fontFamily: config.bodyFont,
        fontSize: `${config.bodySize * 0.75}px`,
        color: config.primaryColor,
        position: 'relative',
        minHeight: '500px',
      }}
    >
      {config.showPerforation && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-gray-200 border-dashed border-t-2 border-gray-400"></div>
      )}

      {/* Header */}
      {config.showHeader && (
        <div style={{ marginBottom: `${config.spacing * 0.75}px`, textAlign: 'center' }}>
          {config.logoUrl && (
            <div style={{ textAlign: config.logoPosition as CanvasTextAlign }}>
              <img
                src={config.logoUrl}
                alt="Logo"
                style={{ width: `${config.logoSize * 0.75}px`, height: 'auto' }}
                className="inline-block"
              />
            </div>
          )}

          <h1
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.titleSize * 0.75}px`,
              color: config.primaryColor,
              margin: 0,
              fontWeight: 'bold',
            }}
          >
            {config.businessName}
          </h1>

          {config.businessTagline && (
            <div style={{ color: config.secondaryColor, marginTop: '2px' }}>{config.businessTagline}</div>
          )}

          <div style={{ color: config.secondaryColor, marginTop: '4px' }}>
            {config.businessAddress.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            <div>{config.businessPhone}</div>
            {config.businessEmail && <div>{config.businessEmail}</div>}
            {config.businessWebsite && <div>{config.businessWebsite}</div>}
          </div>

          <h2
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              margin: '4px 0',
              fontWeight: 'bold',
            }}
          >
            {config.receiptTitle}
          </h2>

          <div style={{ color: config.secondaryColor }}>
            {config.showDateTime && (
              <div>
                {new Date().toLocaleDateString()}{' '}
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {config.showReceiptNumber && <div>Order: #001234</div>}
            {config.showOrderType && <div>Order Type: Dine-in</div>}
          </div>
        </div>
      )}

      {/* Customer Info */}
      {config.showCustomerInfo && (
        <div style={{ marginBottom: `${config.spacing * 0.75}px` }}>
          <div
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              marginBottom: '2px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Customer
          </div>
          <div>
            <div>Name: John Doe</div>
            <div>Phone: (555) 987-6543</div>
          </div>
        </div>
      )}

      {/* Items Section */}
      {config.showItemsSection && (
        <div style={{ marginBottom: `${config.spacing * 0.75}px` }}>
          <div
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              marginBottom: '2px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Items
          </div>

          {/* Table Header */}
          <div style={{ display: 'flex', paddingBottom: '2px', marginBottom: '2px' }}>
            <div style={{ width: '50%', fontWeight: 'bold' }}>Item</div>
            <div style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>Qty</div>
            <div style={{ width: '17.5%', fontWeight: 'bold', textAlign: 'right' }}>Price</div>
            <div style={{ width: '17.5%', fontWeight: 'bold', textAlign: 'right' }}>Total</div>
          </div>

          {/* Items */}
          {sampleItems.map((item, i) => (
            <div key={i} style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '50%' }}>
                  <div>{item.name}</div>
                  {item.variant && (
                    <div style={{ fontSize: `${(config.bodySize - 1) * 0.75}px`, color: config.secondaryColor }}>
                      {item.variant}
                    </div>
                  )}
                  {item.addition && (
                    <div style={{ fontSize: `${(config.bodySize - 1) * 0.75}px`, color: config.secondaryColor }}>
                      + {item.addition}
                    </div>
                  )}
                </div>
                <div style={{ width: '15%', textAlign: 'center' }}>{item.quantity}</div>
                <div style={{ width: '17.5%', textAlign: 'right' }}>${item.price.toFixed(2)}</div>
                <div style={{ width: '17.5%', textAlign: 'right' }}>${(item.quantity * item.price).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      {config.showDivider && (
        <div
          style={{
            borderTopStyle: config.dividerStyle === 'dashed' ? 'dashed' : 'solid',
            borderTopWidth: `${config.dividerWidth}px`,
            borderTopColor: config.secondaryColor,
            margin: `${config.spacing * 0.75}px 0`,
          }}
        ></div>
      )}

      {/* Totals Section */}
      {config.showTotalsSection && (
        <div style={{ marginBottom: `${config.spacing * 0.75}px` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {config.showDiscount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: config.accentColor }}>
              <span>Discount (10%):</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          {config.showTax && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2px',
              paddingTop: '2px',
              fontWeight: 'bold',
              fontSize: `${(config.bodySize + 2) * 0.75}px`,
              color: config.accentColor,
            }}
          >
            <span>TOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Payment Section */}
      {config.showPaymentSection && (
        <div
          style={{
            marginTop: `${config.spacing * 0.75}px`,
            paddingTop: `${config.spacing * 0.75}px`,
            borderTopStyle: config.dividerStyle === 'dashed' ? 'dashed' : 'solid',
            borderTopWidth: `${config.dividerWidth}px`,
            borderTopColor: config.secondaryColor,
          }}
        >
          <div
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              marginBottom: '2px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Payment
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Method:</span>
            <span>{paymentMethod}</span>
          </div>
          {config.showAmountReceived && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Paid:</span>
              <span>${amountReceived.toFixed(2)}</span>
            </div>
          )}
          {config.showChange && change > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Change:</span>
              <span>${change.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Notes Section */}
      {config.showOrderNotes && (
        <div
          style={{
            marginTop: `${config.spacing * 0.75}px`,
            paddingTop: `${config.spacing * 0.75}px`,
            borderTopStyle: 'dashed',
            borderTopWidth: `${config.dividerWidth}px`,
            borderTopColor: config.secondaryColor,
          }}
        >
          <div
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              marginBottom: '2px',
              fontWeight: 'bold',
            }}
          >
            {config.notesTitle}
          </div>
          <div style={{ color: config.secondaryColor }}>Please include extra napkins</div>
        </div>
      )}

      {/* Special Instructions */}
      {config.showSpecialInstructions && (
        <div
          style={{
            marginTop: `${config.spacing * 0.75}px`,
            paddingTop: `${config.spacing * 0.75}px`,
            borderTopStyle: 'dashed',
            borderTopWidth: `${config.dividerWidth}px`,
            borderTopColor: config.secondaryColor,
          }}
        >
          <div
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              marginBottom: '2px',
              fontWeight: 'bold',
            }}
          >
            {config.instructionsTitle}
          </div>
          <div style={{ color: config.secondaryColor }}>No onions on the sandwich</div>
        </div>
      )}

      {/* Promo Code */}
      {config.showPromoCode && (
        <div
          style={{
            marginTop: `${config.spacing * 0.75}px`,
            paddingTop: `${config.spacing * 0.75}px`,
            borderTopStyle: 'dashed',
            borderTopWidth: `${config.dividerWidth}px`,
            borderTopColor: config.secondaryColor,
          }}
        >
          <div
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              marginBottom: '2px',
              fontWeight: 'bold',
            }}
          >
            {config.promoCodeText}
          </div>
          <div style={{ color: config.accentColor }}>SUMMER2023</div>
        </div>
      )}

      {/* QR Code */}
      {config.showQRCode && (
        <div
          style={{
            marginTop: `${config.spacing * 1.5}px`,
            paddingTop: `${config.spacing * 1.5}px`,
            borderTopStyle: 'dashed',
            borderTopWidth: `${config.dividerWidth}px`,
            borderTopColor: config.secondaryColor,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              marginBottom: '4px',
              fontWeight: 'bold',
            }}
          >
            {config.qrCodeText}
          </div>
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#eee',
              margin: '0 auto 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: config.secondaryColor,
            }}
          >
            [QR Code]
          </div>
          <div style={{ fontSize: `${(config.bodySize - 1) * 0.75}px`, color: config.secondaryColor }}>
            Order ID: #001234
          </div>
        </div>
      )}

      {/* Footer */}
      {config.showFooter && (
        <div
          style={{
            marginTop: `${config.spacing * 1.5}px`,
            paddingTop: `${config.spacing * 1.5}px`,
            borderTopStyle: 'dashed',
            borderTopWidth: `${config.dividerWidth}px`,
            borderTopColor: config.secondaryColor,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: config.headerFont,
              fontSize: `${config.headerSize * 0.75}px`,
              color: config.primaryColor,
              marginBottom: '4px',
              fontWeight: 'bold',
            }}
          >
            {config.thankYouMessage}
          </div>
          <div style={{ color: config.secondaryColor }}>{config.footerText}</div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'content', label: 'Content', icon: Type },
    { id: 'sections', label: 'Sections', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipt Customizer</h1>
          <p className="text-gray-600">Design your perfect thermal receipt template</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Tab Navigation */}
            <div className="flex border-b mb-6 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === 'basic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={config.businessName}
                      onChange={e => updateConfig('businessName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (Optional)</label>
                    <input
                      type="text"
                      value={config.businessTagline}
                      onChange={e => updateConfig('businessTagline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                    <textarea
                      value={config.businessAddress}
                      onChange={e => updateConfig('businessAddress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={config.businessPhone}
                        onChange={e => updateConfig('businessPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                      <input
                        type="email"
                        value={config.businessEmail}
                        onChange={e => updateConfig('businessEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                    <input
                      type="url"
                      value={config.businessWebsite}
                      onChange={e => updateConfig('businessWebsite', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (Optional)</label>
                    <input
                      type="url"
                      value={config.logoUrl}
                      onChange={e => updateConfig('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Title</label>
                    <input
                      type="text"
                      value={config.receiptTitle}
                      onChange={e => updateConfig('receiptTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {activeTab === 'design' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={e => updateConfig('primaryColor', e.target.value)}
                          className="w-10 h-10 border border-gray-300 rounded-md mr-2"
                        />
                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={e => updateConfig('primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={config.secondaryColor}
                          onChange={e => updateConfig('secondaryColor', e.target.value)}
                          className="w-10 h-10 border border-gray-300 rounded-md mr-2"
                        />
                        <input
                          type="text"
                          value={config.secondaryColor}
                          onChange={e => updateConfig('secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={config.backgroundColor}
                          onChange={e => updateConfig('backgroundColor', e.target.value)}
                          className="w-10 h-10 border border-gray-300 rounded-md mr-2"
                        />
                        <input
                          type="text"
                          value={config.backgroundColor}
                          onChange={e => updateConfig('backgroundColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={config.accentColor}
                          onChange={e => updateConfig('accentColor', e.target.value)}
                          className="w-10 h-10 border border-gray-300 rounded-md mr-2"
                        />
                        <input
                          type="text"
                          value={config.accentColor}
                          onChange={e => updateConfig('accentColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Header Font</label>
                      <select
                        value={config.headerFont}
                        onChange={e => updateConfig('headerFont', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Body Font</label>
                      <select
                        value={config.bodyFont}
                        onChange={e => updateConfig('bodyFont', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title Size: {config.titleSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={config.titleSize}
                        onChange={e => updateConfig('titleSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Header Size: {config.headerSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="18"
                        value={config.headerSize}
                        onChange={e => updateConfig('headerSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Body Size: {config.bodySize}px
                      </label>
                      <input
                        type="range"
                        min="6"
                        max="12"
                        value={config.bodySize}
                        onChange={e => updateConfig('bodySize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'layout' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width: {config.width}px</label>
                    <input
                      type="range"
                      min="200"
                      max="300"
                      value={config.width}
                      onChange={e => updateConfig('width', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Padding: {config.padding}px
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="20"
                        value={config.padding}
                        onChange={e => updateConfig('padding', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spacing: {config.spacing}px
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        value={config.spacing}
                        onChange={e => updateConfig('spacing', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Radius: {config.borderRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={config.borderRadius}
                      onChange={e => updateConfig('borderRadius', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showBorder}
                        onChange={e => updateConfig('showBorder', e.target.checked)}
                        className="mr-2"
                      />
                      Show Border
                    </label>
                    {config.showBorder && (
                      <input
                        type="color"
                        value={config.borderColor}
                        onChange={e => updateConfig('borderColor', e.target.value)}
                        className="h-8 w-16 border border-gray-300 rounded"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showDivider}
                        onChange={e => updateConfig('showDivider', e.target.checked)}
                        className="mr-2"
                      />
                      Show Divider
                    </label>
                    {config.showDivider && (
                      <>
                        <select
                          value={config.dividerStyle}
                          onChange={e => updateConfig('dividerStyle', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.5"
                          value={config.dividerWidth}
                          onChange={e => updateConfig('dividerWidth', parseFloat(e.target.value))}
                          className="w-20"
                        />
                        <span>{config.dividerWidth}px</span>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Size: {config.logoSize}px
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={config.logoSize}
                        onChange={e => updateConfig('logoSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo Position</label>
                      <select
                        value={config.logoPosition}
                        onChange={e => updateConfig('logoPosition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showPerforation}
                        onChange={e => updateConfig('showPerforation', e.target.checked)}
                        className="mr-2"
                      />
                      Show Perforation (Thermal Style)
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'content' && (
                <>
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Receipt Information</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showDateTime}
                        onChange={e => updateConfig('showDateTime', e.target.checked)}
                        className="mr-3"
                      />
                      Show Date & Time
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showReceiptNumber}
                        onChange={e => updateConfig('showReceiptNumber', e.target.checked)}
                        className="mr-3"
                      />
                      Show Receipt Number
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showOrderType}
                        onChange={e => updateConfig('showOrderType', e.target.checked)}
                        className="mr-3"
                      />
                      Show Order Type
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showCustomerInfo}
                        onChange={e => updateConfig('showCustomerInfo', e.target.checked)}
                        className="mr-3"
                      />
                      Show Customer Information
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showCashier}
                        onChange={e => updateConfig('showCashier', e.target.checked)}
                        className="mr-3"
                      />
                      Show Cashier
                    </label>
                  </div>

                  <div className="space-y-3 mt-4">
                    <h3 className="font-medium text-gray-900">Payment Information</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showTax}
                        onChange={e => updateConfig('showTax', e.target.checked)}
                        className="mr-3"
                      />
                      Show Tax
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showDiscount}
                        onChange={e => updateConfig('showDiscount', e.target.checked)}
                        className="mr-3"
                      />
                      Show Discount
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showPaymentMethod}
                        onChange={e => updateConfig('showPaymentMethod', e.target.checked)}
                        className="mr-3"
                      />
                      Show Payment Method
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showAmountReceived}
                        onChange={e => updateConfig('showAmountReceived', e.target.checked)}
                        className="mr-3"
                      />
                      Show Amount Received
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showChange}
                        onChange={e => updateConfig('showChange', e.target.checked)}
                        className="mr-3"
                      />
                      Show Change
                    </label>
                  </div>

                  <div className="space-y-3 mt-4">
                    <h3 className="font-medium text-gray-900">Additional Content</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showQRCode}
                        onChange={e => updateConfig('showQRCode', e.target.checked)}
                        className="mr-3"
                      />
                      Show QR Code
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showPromoCode}
                        onChange={e => updateConfig('showPromoCode', e.target.checked)}
                        className="mr-3"
                      />
                      Show Promo Code
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showOrderNotes}
                        onChange={e => updateConfig('showOrderNotes', e.target.checked)}
                        className="mr-3"
                      />
                      Show Order Notes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showSpecialInstructions}
                        onChange={e => updateConfig('showSpecialInstructions', e.target.checked)}
                        className="mr-3"
                      />
                      Show Special Instructions
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thank You Message</label>
                    <input
                      type="text"
                      value={config.thankYouMessage}
                      onChange={e => updateConfig('thankYouMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                    <input
                      type="text"
                      value={config.footerText}
                      onChange={e => updateConfig('footerText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {activeTab === 'sections' && (
                <>
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Receipt Sections</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showHeader}
                        onChange={e => updateConfig('showHeader', e.target.checked)}
                        className="mr-3"
                      />
                      Show Header Section
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showItemsSection}
                        onChange={e => updateConfig('showItemsSection', e.target.checked)}
                        className="mr-3"
                      />
                      Show Items Section
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showTotalsSection}
                        onChange={e => updateConfig('showTotalsSection', e.target.checked)}
                        className="mr-3"
                      />
                      Show Totals Section
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showPaymentSection}
                        onChange={e => updateConfig('showPaymentSection', e.target.checked)}
                        className="mr-3"
                      />
                      Show Payment Section
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showFooter}
                        onChange={e => updateConfig('showFooter', e.target.checked)}
                        className="mr-3"
                      />
                      Show Footer Section
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Text</label>
                    <input
                      type="text"
                      value={config.qrCodeText}
                      onChange={e => updateConfig('qrCodeText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code Text</label>
                    <input
                      type="text"
                      value={config.promoCodeText}
                      onChange={e => updateConfig('promoCodeText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes Title</label>
                    <input
                      type="text"
                      value={config.notesTitle}
                      onChange={e => updateConfig('notesTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions Title</label>
                    <input
                      type="text"
                      value={config.instructionsTitle}
                      onChange={e => updateConfig('instructionsTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Export Buttons */}
            <div className="mt-8 pt-6 border-t space-y-3">
              <button
                onClick={saveConfig}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Settings size={16} className="mr-2" />
                Save Configuration
              </button>
              <button
                onClick={exportConfig}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Download size={16} className="mr-2" />
                Export Configuration
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Eye size={20} className="mr-2" />
                Live Preview
              </h2>
              <div className="text-sm text-gray-500">Width: {config.width}px</div>
            </div>

            <div className="flex justify-center bg-gray-100 p-8 rounded-lg overflow-auto">
              <ReceiptPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptCustomizer;
