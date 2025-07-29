import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { InvoiceData } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Thermal printer styles (80mm width)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 8,
    width: 226, // 80mm in points (80mm * 2.834)
    minHeight: 'auto',
  },

  // Header Section
  header: {
    alignItems: 'center',
    marginBottom: 12,
    borderBottom: '1px solid #000',
    paddingBottom: 8,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  restaurantDetails: {
    fontSize: 8,
    textAlign: 'center',
    color: '#333',
    marginBottom: 1,
  },

  // Invoice Info
  invoiceInfo: {
    marginBottom: 10,
    paddingVertical: 6,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 4,
  },
  invoiceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  invoiceLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  invoiceValue: {
    fontSize: 8,
  },

  // Customer Section
  customerSection: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1px dashed #999',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  customerInfo: {
    fontSize: 8,
    marginBottom: 1,
  },

  // Order Details
  orderDetails: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1px dashed #999',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  orderLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    width: '40%',
  },
  orderValue: {
    fontSize: 8,
    width: '60%',
    textAlign: 'right',
  },

  // Items Table
  itemsSection: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 3,
    paddingHorizontal: 2,
    marginBottom: 1,
  },
  headerText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemRow: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderBottom: '0.5px solid #eee',
  },
  itemName: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  itemDetails: {
    fontSize: 7,
    color: '#666',
    marginBottom: 2,
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  price: {
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Summary Section
  summarySection: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid #000',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 8,
    textAlign: 'left',
  },
  summaryValue: {
    fontSize: 8,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalRow: {
    backgroundColor: '#000',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // QR Code Section
  qrSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    paddingVertical: 8,
    borderTop: '1px dashed #999',
    borderBottom: '1px dashed #999',
  },
  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  qrText: {
    fontSize: 7,
    textAlign: 'center',
    color: '#666',
  },

  // Notes Section
  notesSection: {
    marginTop: 8,
    paddingTop: 6,
    borderTop: '1px dashed #999',
  },
  notesText: {
    fontSize: 7,
    color: '#666',
    lineHeight: 1.3,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 8,
    borderTop: '2px solid #000',
  },
  footerText: {
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  footerSubtext: {
    fontSize: 7,
    textAlign: 'center',
    color: '#666',
  },

  // Status Badge
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 6,
  },
  dashedDivider: {
    borderBottom: '1px dashed #999',
    marginVertical: 4,
  },
});

interface InvoicePDFProps {
  data: InvoiceData;
}

export const InvoicePDF = ({ data }: InvoicePDFProps) => {
  const { order, restaurantName, restaurantAddress, restaurantPhone, restaurantEmail, qrCodeImage } = data;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  return (
    <Document>
      <Page size={[226, 650]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <Text style={styles.restaurantDetails}>{restaurantAddress}</Text>
          <Text style={styles.restaurantDetails}>📞 {restaurantPhone}</Text>
          <Text style={styles.restaurantDetails}>✉ {restaurantEmail}</Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceLabel}>Order #</Text>
            <Text style={styles.invoiceValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceLabel}>Date</Text>
            <Text style={styles.invoiceValue}>{format(new Date(order.datetime), 'dd/MM/yyyy HH:mm')}</Text>
          </View>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceLabel}>Cashier</Text>
            <Text style={styles.invoiceValue}>Admin</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.customerInfo}>👤 {order.customer?.name || 'Walk-in Customer'}</Text>
          {order.customer?.phone && <Text style={styles.customerInfo}>📱 {order.customer.phone}</Text>}
          {order.customer?.email && <Text style={styles.customerInfo}>✉ {order.customer.email}</Text>}
          {order.customer?.address && <Text style={styles.customerInfo}>📍 {order.customer.address}</Text>}
        </View>

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <Text style={styles.sectionTitle}>Order Info</Text>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Type:</Text>
            <Text style={styles.orderValue}>{order.orderType}</Text>
          </View>
          {order.tableNumber && (
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Table:</Text>
              <Text style={styles.orderValue}>{order.tableNumber}</Text>
            </View>
          )}
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Payment:</Text>
            <Text style={styles.orderValue}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>

          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              {(item.variant || item.addition) && (
                <Text style={styles.itemDetails}>
                  {item.variant && `• ${item.variant}`}
                  {item.addition && ` • ${item.addition}`}
                </Text>
              )}
              <View style={styles.itemPricing}>
                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                <Text style={styles.price}>
                  {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>

          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>-{formatCurrency(order.discount)}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (2.5%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.tax)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* QR Code */}
        {qrCodeImage && (
          <View style={styles.qrSection}>
            <Image src={qrCodeImage} style={styles.qrCode} />
            <Text style={styles.qrText}>Scan for payment or order tracking</Text>
          </View>
        )}

        {/* Notes */}
        {order.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Special Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank You for Your Order!</Text>
          <Text style={styles.footerSubtext}>Please keep this receipt for your records</Text>
          <Text style={styles.footerSubtext}>{format(new Date(), 'dd/MM/yyyy HH:mm')} - Powered by RestaurantPOS</Text>
        </View>
      </Page>
    </Document>
  );
};
