import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { PaymentData } from './InvoiceModal';
import { CartItem } from '@/types';
import { useReceiptConfigStore } from '@/store/receipt';

// Create dynamic styles based on config
const createStyles = (config: ReceiptConfig) => {
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: config.backgroundColor,
      padding: config.padding,
      width: config.width,
      minHeight: 'auto',
      fontSize: config.bodySize,
      // fontFamily: config.bodyFont,
    },
    header: {
      alignItems: 'center',
      marginBottom: config.spacing,
      paddingBottom: config.spacing,
      borderBottomStyle: config.dividerStyle,
      borderBottomWidth: config.dividerWidth,
      borderBottomColor: config.secondaryColor,
    },
    companyName: {
      fontSize: config.titleSize,
      fontWeight: 'bold',
      color: config.primaryColor,
      marginBottom: config.spacing / 2,
      textAlign: 'center',
      // fontFamily: config.headerFont,
    },
    companyDetails: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      textAlign: 'center',
      marginBottom: 1,
      // fontFamily: config.bodyFont,
    },
    invoiceTitle: {
      fontSize: config.headerSize + 2,
      fontWeight: 'bold',
      color: config.primaryColor,
      marginTop: config.spacing,
      marginBottom: config.spacing / 2,
      textAlign: 'center',
      // fontFamily: config.headerFont,
    },
    invoiceDetails: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      marginBottom: 1,
      textAlign: 'center',
      // fontFamily: config.bodyFont,
    },
    section: {
      marginBottom: config.spacing * 1.5,
    },
    sectionTitle: {
      fontSize: config.headerSize,
      fontWeight: 'bold',
      color: config.primaryColor,
      marginBottom: config.spacing / 2,
      textAlign: 'left',
      textTransform: 'uppercase',
      // fontFamily: config.headerFont,
    },
    customerInfo: {
      marginBottom: config.spacing,
    },
    customerRow: {
      flexDirection: 'row',
      marginBottom: config.spacing / 2,
    },
    customerLabel: {
      fontSize: config.bodySize,
      fontWeight: 'bold',
      width: 50,
      color: config.primaryColor,
      // fontFamily: config.bodyFont,
    },
    customerValue: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      flex: 1,
      // fontFamily: config.bodyFont,
    },
    table: {
      width: '100%',
    },
    tableHeader: {
      flexDirection: 'row',
      paddingBottom: config.spacing / 2,
      marginBottom: config.spacing / 2,
    },
    tableHeaderCell: {
      fontSize: config.bodySize,
      fontWeight: 'bold',
      color: config.primaryColor,
      // fontFamily: config.bodyFont,
    },
    itemName: {
      width: '50%',
      fontSize: config.bodySize,
      color: config.primaryColor,
      // fontFamily: config.bodyFont,
    },
    itemQty: {
      width: '15%',
      fontSize: config.bodySize,
      color: config.primaryColor,
      textAlign: 'center',
      // fontFamily: config.bodyFont,
    },
    itemPrice: {
      width: '17.5%',
      fontSize: config.bodySize,
      color: config.primaryColor,
      textAlign: 'right',
      // fontFamily: config.bodyFont,
    },
    itemTotal: {
      width: '17.5%',
      fontSize: config.bodySize,
      color: config.primaryColor,
      textAlign: 'right',
      // fontFamily: config.bodyFont,
    },
    itemVariant: {
      fontSize: config.bodySize - 1,
      color: config.secondaryColor,
      marginTop: 1,
      // fontFamily: config.bodyFont,
    },
    divider: {
      borderTopStyle: config.dividerStyle,
      borderTopWidth: config.dividerWidth,
      borderTopColor: config.secondaryColor,
      marginVertical: config.spacing,
    },
    totalsSection: {
      marginTop: config.spacing,
    },
    totalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: config.spacing / 2,
    },
    totalsLabel: {
      fontSize: config.bodySize,
      color: config.primaryColor,
      // fontFamily: config.bodyFont,
    },
    totalsValue: {
      fontSize: config.bodySize,
      color: config.primaryColor,
      textAlign: 'right',
      // fontFamily: config.bodyFont,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: config.spacing / 2,
      paddingTop: config.spacing / 2,
    },
    totalLabel: {
      fontSize: config.headerSize,
      fontWeight: 'bold',
      color: config.accentColor,
      // fontFamily: config.headerFont,
    },
    totalValue: {
      fontSize: config.headerSize,
      fontWeight: 'bold',
      color: config.accentColor,
      textAlign: 'right',
      // fontFamily: config.headerFont,
    },
    paymentSection: {
      marginTop: config.spacing * 1.5,
      paddingTop: config.spacing,
      borderTopStyle: config.dividerStyle,
      borderTopWidth: config.dividerWidth,
      borderTopColor: config.secondaryColor,
    },
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: config.spacing / 2,
    },
    paymentLabel: {
      fontSize: config.bodySize,
      color: config.primaryColor,
      fontWeight: 'bold',
      // fontFamily: config.bodyFont,
    },
    paymentValue: {
      fontSize: config.bodySize,
      color: config.primaryColor,
      textAlign: 'right',
      // fontFamily: config.bodyFont,
    },
    qrSection: {
      marginTop: config.spacing * 2,
      alignItems: 'center',
      paddingTop: config.spacing * 1.5,
      borderTopStyle: 'dashed',
      borderTopWidth: config.dividerWidth,
      borderTopColor: config.secondaryColor,
    },
    qrTitle: {
      fontSize: config.headerSize + 1,
      fontWeight: 'bold',
      color: config.primaryColor,
      marginBottom: config.spacing / 2,
      textAlign: 'center',
      // fontFamily: config.headerFont,
    },
    qrCode: {
      width: 80,
      height: 80,
      marginBottom: config.spacing / 2,
    },
    qrSubtext: {
      fontSize: config.bodySize - 1,
      color: config.secondaryColor,
      textAlign: 'center',
      marginBottom: 1,
      // fontFamily: config.bodyFont,
    },
    footer: {
      marginTop: config.spacing * 2,
      textAlign: 'center',
      paddingTop: config.spacing,
      borderTopStyle: 'dashed',
      borderTopWidth: config.dividerWidth,
      borderTopColor: config.secondaryColor,
    },
    footerText: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      marginBottom: config.spacing / 2,
      textAlign: 'center',
      // fontFamily: config.bodyFont,
    },
    orderNotes: {
      marginTop: config.spacing * 1.5,
      paddingTop: config.spacing,
      borderTopStyle: 'dashed',
      borderTopWidth: config.dividerWidth,
      borderTopColor: config.secondaryColor,
    },
    noteTitle: {
      fontSize: config.headerSize + 1,
      fontWeight: 'bold',
      color: config.primaryColor,
      marginBottom: config.spacing / 2,
      // fontFamily: config.headerFont,
    },
    noteText: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      marginBottom: config.spacing,
      // fontFamily: config.bodyFont,
    },
    promoSection: {
      marginTop: config.spacing,
      paddingTop: config.spacing,
      borderTopStyle: 'dashed',
      borderTopWidth: config.dividerWidth,
      borderTopColor: config.secondaryColor,
    },
  });
};

export const ThermalReceiptPDF = ({
  items,
  paymentData,
  qrCodeImage,
  organization,
  orderType,
  notes,
  promoCode,
  specialInstructions,
}: ThermalReceiptPDFProps) => {
  const { config } = useReceiptConfigStore();
  const styles = createStyles(config);

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
      <Page size={[config.width, 600]} style={styles.page}>
        {/* Header */}
        {config.showHeader && (
          <View style={styles.header}>
            <Text style={styles.companyName}>{config.businessName || organization.name}</Text>
            {(config.businessTagline || organization.tagline) && (
              <Text style={styles.companyDetails}>{config.businessTagline || organization.tagline}</Text>
            )}
            <Text style={styles.companyDetails}>{config.businessAddress || organization.address}</Text>
            <Text style={styles.companyDetails}>Tel: {config.businessPhone || organization.phone}</Text>
            {(config.businessEmail || organization.email) && (
              <Text style={styles.companyDetails}>Email: {config.businessEmail || organization.email}</Text>
            )}
            {(config.businessWebsite || organization.website) && (
              <Text style={styles.companyDetails}>{config.businessWebsite || organization.website}</Text>
            )}

            <Text style={styles.invoiceTitle}>{config.receiptTitle}</Text>
            {config.showReceiptNumber && <Text style={styles.invoiceDetails}>Order: {paymentData.orderId}</Text>}
            {config.showDateTime && (
              <Text style={styles.invoiceDetails}>
                {currentDate} {currentTime}
              </Text>
            )}
            {config.showOrderType && orderType && (
              <Text style={styles.invoiceDetails}>
                Order Type: {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
              </Text>
            )}
          </View>
        )}

        {/* Customer Information */}
        {config.showCustomerInfo && (paymentData.customerName || paymentData.customerPhone) && (
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
        {config.showItemsSection && (
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
                    <Text style={styles.itemPrice}>{item.price}</Text>
                    <Text style={styles.itemTotal}>{(item.price * item.quantity)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {config.showDivider && <View style={styles.divider} />}

        {/* Totals */}
        {config.showTotalsSection && (
          <View style={styles.totalsSection}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal:</Text>
              <Text style={styles.totalsValue}>{subtotal}</Text>
            </View>
            {config.showDiscount && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount (10%):</Text>
                <Text style={styles.totalsValue}>-{discount}</Text>
              </View>
            )}
            {config.showTax && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax (2.5%):</Text>
                <Text style={styles.totalsValue}>{tax}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>{total}</Text>
            </View>
          </View>
        )}

        {/* Payment Information */}
        {config.showPaymentSection && (
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment</Text>
            {config.showPaymentMethod && (
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
            )}
            {config.showAmountReceived && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Paid:</Text>
                <Text style={styles.paymentValue}>{paymentData.amountPaid}</Text>
              </View>
            )}
            {config.showChange && paymentData.change > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Change:</Text>
                <Text style={styles.paymentValue}>{paymentData.change}</Text>
              </View>
            )}
          </View>
        )}

        {/* Notes Section */}
        {config.showOrderNotes && (notes || specialInstructions) && (
          <View style={styles.orderNotes}>
            {notes && (
              <>
                <Text style={styles.noteTitle}>{config.notesTitle}</Text>
                <Text style={styles.noteText}>{notes}</Text>
              </>
            )}
            {config.showSpecialInstructions && specialInstructions && (
              <>
                <Text style={styles.noteTitle}>{config.instructionsTitle}</Text>
                <Text style={styles.noteText}>{specialInstructions}</Text>
              </>
            )}
          </View>
        )}

        {/* Promo Code Section */}
        {config.showPromoCode && promoCode && (
          <View style={styles.promoSection}>
            <Text style={styles.noteTitle}>{config.promoCodeText}</Text>
            <Text style={styles.noteText}>{promoCode}</Text>
          </View>
        )}

        {/* QR Code Section */}
        {config.showQRCode && (
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>{config.qrCodeText}</Text>
            <Image style={styles.qrCode} src={qrCodeImage} />
            <Text style={styles.qrSubtext}>Order ID: {paymentData.orderId}</Text>
            <Text style={styles.qrSubtext}>{config.thankYouMessage}</Text>
          </View>
        )}

        {/* Footer */}
        {config.showFooter && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>{config.thankYouMessage}</Text>
            {(config.businessEmail || organization.email) && (
              <Text style={styles.footerText}>Questions? Email: {config.businessEmail || organization.email}</Text>
            )}
            <Text style={styles.footerText}>{config.footerText}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
