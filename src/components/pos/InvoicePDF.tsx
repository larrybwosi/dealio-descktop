import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { InvoiceData } from '@/types';
import { formatCurrency, useFormattedCurrency } from '@/lib/utils';

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  restaurant: {
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantDetails: {
    fontSize: 10,
    color: '#555',
  },
  table: {
    // @ts-expect-error table not defined
    display: 'table',
    width: 'auto',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#F8F8F8',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCol: {
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryLabel: {
    width: 100,
  },
  summaryValue: {
    width: 80,
    textAlign: 'right',
  },
  total: {
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#555',
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  qrCode: {
    width: 100,
    height: 100,
  },
  qrText: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  notes: {
    marginTop: 20,
    fontSize: 10,
    color: '#555',
  },
});

interface InvoicePDFProps {
  data: InvoiceData;
}

export const InvoicePDF = ({ data }: InvoicePDFProps) => {
  const { 
    order, 
    restaurantName, 
    restaurantAddress, 
    restaurantPhone, 
    restaurantEmail, 
    qrCodeImage 
  } = data;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.subtitle}>Order #{order.orderNumber}</Text>
            <Text style={styles.subtitle}>
              Date: {format(new Date(order.datetime), "dd/MM/yyyy HH:mm")}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
            <Text style={styles.restaurantDetails}>{restaurantAddress}</Text>
            <Text style={styles.restaurantDetails}>
              Phone: {restaurantPhone}
            </Text>
            <Text style={styles.restaurantDetails}>
              Email: {restaurantEmail}
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.bold}>Customer Information</Text>
          <Text>{order.customer?.name || "Walk-in Customer"}</Text>
          {order.customer?.phone && <Text>{order.customer.phone}</Text>}
          {order.customer?.email && <Text>{order.customer.email}</Text>}
          {order.customer?.address && <Text>{order.customer.address}</Text>}
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.bold}>Order Details</Text>
          <Text>Type: {order.orderType}</Text>
          {order.tableNumber && <Text>Table: {order.tableNumber}</Text>}
          <Text>Status: {order.status}</Text>
          <Text>Payment Method: {order.paymentMethod}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "40%" }]}>
              <Text style={styles.tableCell}>Item</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "20%" }]}>
              <Text style={styles.tableCell}>Variant</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "10%" }]}>
              <Text style={styles.tableCell}>Qty</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "15%" }]}>
              <Text style={styles.tableCell}>Price</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "15%" }]}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>

          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "40%" }]}>
                <Text style={styles.tableCell}>{item.name}</Text>
              </View>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text style={styles.tableCell}>
                  {item.variant || "-"}
                  {item.addition ? `, ${item.addition}` : ""}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}>{formatCurrency(item.price)}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.discount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (2.5%):</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.tax)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.total]}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>

        {/* QR Code for Payment */}
        <View style={styles.qrSection}>
          {qrCodeImage && (
            <>
              <Text style={styles.qrText}>
                Scan to pay or check order status
              </Text>
              <Image src={qrCodeImage} style={styles.qrCode} />
            </>
          )}
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.notes}>
            <Text style={styles.bold}>Notes:</Text>
            <Text>{order.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for dining with us!</Text>
          <Text>
            {restaurantName} - {restaurantPhone}
          </Text>
        </View>
      </Page>
    </Document>
  );
};