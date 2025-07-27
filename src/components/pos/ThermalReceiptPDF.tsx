import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { CartItem } from '@/types/pos';
import { PaymentData } from './InvoiceModal';

// Register fonts
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 8,
      fontFamily: 'Roboto',
      width: 226.77, // 80mm thermal printer width in points
      minHeight: 'auto',
      fontSize: 8,
    },
    header: {
      alignItems: 'center',
      marginBottom: 8,
      paddingBottom: 6,
      borderBottomStyle: 'solid',
      borderBottomWidth: 0.5,
      borderBottomColor: '#000000',
    },
    companyName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 2,
      textAlign: 'center',
    },
    companyDetails: {
      fontSize: 8,
      color: '#000000',
      textAlign: 'center',
      marginBottom: 1,
    },
    invoiceTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#000000',
      marginTop: 4,
      marginBottom: 3,
      textAlign: 'center',
    },
    invoiceDetails: {
      fontSize: 8,
      color: '#000000',
      marginBottom: 1,
      textAlign: 'center',
    },
    section: {
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 3,
      textAlign: 'left',
      textTransform: 'uppercase',
    },
    customerInfo: {
      marginBottom: 4,
    },
    customerRow: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    customerLabel: {
      fontSize: 8,
      fontWeight: 'bold',
      width: 50,
      color: '#000000',
    },
    customerValue: {
      fontSize: 8,
      color: '#000000',
      flex: 1,
    },
    table: {
      width: '100%',
    },
    tableHeader: {
      flexDirection: 'row',
      paddingBottom: 2,
      marginBottom: 2,
    },
    tableHeaderCell: {
      fontSize: 8,
      fontWeight: 'bold',
      color: '#000000',
    },
    tableRow: {
      flexDirection: 'row',
      marginBottom: 2,
      alignItems: 'flex-start',
    },
    itemName: {
      width: '50%',
      fontSize: 8,
      color: '#000000',
    },
    itemQty: {
      width: '15%',
      fontSize: 8,
      color: '#000000',
      textAlign: 'center',
    },
    itemPrice: {
      width: '17.5%',
      fontSize: 8,
      color: '#000000',
      textAlign: 'right',
    },
    itemTotal: {
      width: '17.5%',
      fontSize: 8,
      color: '#000000',
      textAlign: 'right',
    },
    itemVariant: {
      fontSize: 7,
      color: '#666666',
      marginTop: 1,
    },
    divider: {
      borderTopStyle: 'solid',
      borderTopWidth: 0.5,
      borderTopColor: '#000000',
      marginVertical: 2,
    },
    totalsSection: {
      marginTop: 2,
    },
    totalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    totalsLabel: {
      fontSize: 8,
      color: '#000000',
    },
    totalsValue: {
      fontSize: 8,
      color: '#000000',
      textAlign: 'right',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
      paddingTop: 0,
    },
    totalLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#000000',
    },
    totalValue: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'right',
    },
    paymentSection: {
      marginTop: 6,
      paddingTop: 4,
      borderTopStyle: 'solid',
      borderTopWidth: 0.5,
      borderTopColor: '#000000',
    },
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    paymentLabel: {
      fontSize: 8,
      color: '#000000',
      fontWeight: 'bold',
    },
    paymentValue: {
      fontSize: 8,
      color: '#000000',
      textAlign: 'right',
    },
    qrSection: {
      marginTop: 8,
      alignItems: 'center',
      paddingTop: 6,
      borderTopStyle: 'dashed',
      borderTopWidth: 0.5,
      borderTopColor: '#000000',
    },
    qrTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 3,
      textAlign: 'center',
    },
    qrCode: {
      width: 80,
      height: 80,
      marginBottom: 3,
    },
  qrSubtext: {
  fontSize: 7,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 1,
},
footer: {
  marginTop: 15,
    textAlign: 'center',
    paddingTop: 8,
    borderTopStyle: 'dashed',
    borderTopWidth: 0.5,
    borderTopColor: '#000000',
},
footerText: {
  fontSize: 8,
    color: '#000000',
    marginBottom: 2,
    textAlign: 'center',
},
});

export interface OrganizationData {
  name: string;
  tagline?: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
}

export interface ThermalReceiptPDFProps {
  items: CartItem[];
  paymentData: PaymentData;
  qrCodeImage: string;
  organization: OrganizationData;
}

export const ThermalReceiptPDF = ({ items, paymentData, qrCodeImage, organization }: ThermalReceiptPDFProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * 0.1; // 10% discount
  const tax = subtotal * 0.025; // 2.5% tax
  const total = subtotal - discount + tax;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <Document>
      <Page size={[226.77, 600]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{organization.name}</Text>
          {organization.tagline && <Text style={styles.companyDetails}>{organization.tagline}</Text>}
          <Text style={styles.companyDetails}>{organization.address}</Text>
          <Text style={styles.companyDetails}>Tel: {organization.phone}</Text>
          {organization.email && <Text style={styles.companyDetails}>Email: {organization.email}</Text>}
          {organization.website && <Text style={styles.companyDetails}>{organization.website}</Text>}

          <Text style={styles.invoiceTitle}>RECEIPT</Text>
          <Text style={styles.invoiceDetails}>Order: {paymentData.orderId}</Text>
          <Text style={styles.invoiceDetails}>
            {currentDate} {currentTime}
          </Text>
        </View>

        {/* Customer Information */}
        {(paymentData.customerName || paymentData.customerPhone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <View style={styles.customerInfo}>
              {paymentData.customerName && (
                <View style={styles.customerRow}>
                  <Text style={styles.customerLabel}>Name:</Text>
                  <Text style={styles.customerValue}>{paymentData.customerName}</Text>
                </View>
              )}
              {paymentData.customerPhone && (
                <View style={styles.customerRow}>
                  <Text style={styles.customerLabel}>Phone:</Text>
                  <Text style={styles.customerValue}>{paymentData.customerPhone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Item</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, { width: '17.5%', textAlign: 'right' }]}>Price</Text>
              <Text style={[styles.tableHeaderCell, { width: '17.5%', textAlign: 'right' }]}>Total</Text>
            </View>

            {/* Table Rows */}
            {items.map((item, index) => (
              <View key={index}>
                <View style={styles.tableRow}>
                  <View style={styles.itemName}>
                    <Text>{item.name}</Text>
                    {item.variant && <Text style={styles.itemVariant}>{item.variant}</Text>}
                    {item.addition && <Text style={styles.itemVariant}>+ {item.addition}</Text>}
                  </View>
                  <Text style={styles.itemQty}>{item.quantity}</Text>
                  <Text style={styles.itemPrice}>{item.price.toString()}</Text>
                  <Text style={styles.itemTotal}>{(item.price * item.quantity).toString()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal:</Text>
            <Text style={styles.totalsValue}>{subtotal.toString()}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount (10%):</Text>
            <Text style={styles.totalsValue}>-{discount.toString()}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax (2.5%):</Text>
            <Text style={styles.totalsValue}>{tax.toString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>{total.toString()}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Method:</Text>
            <Text style={styles.paymentValue}>
              {paymentData.paymentMethod === 'cash'
                ? 'Cash'
                : paymentData.paymentMethod === 'mobile'
                ? 'Mobile Payment'
                : 'Card Payment'}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Paid:</Text>
            <Text style={styles.paymentValue}>{paymentData.amountPaid.toString()}</Text>
          </View>
          {paymentData.change > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Change:</Text>
              <Text style={styles.paymentValue}>{paymentData.change.toString()}</Text>
            </View>
          )}
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Scan for Details</Text>
          <Image style={styles.qrCode} src={qrCodeImage} />
          <Text style={styles.qrSubtext}>Order ID: {paymentData.orderId}</Text>
          <Text style={styles.qrSubtext}>Thank you for your purchase!</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          {organization.email && <Text style={styles.footerText}>Questions? Email: {organization.email}</Text>}
          <Text style={styles.footerText}>Keep this receipt for your records</Text>
        </View>
      </Page>
    </Document>
  );
};
