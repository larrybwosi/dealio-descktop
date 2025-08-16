import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { PaymentData, CartItem, OrganizationData, ReceiptConfig } from "@/types"
import { useFormattedCurrency } from "@/lib/utils"

const createStyles = (config: ReceiptConfig) =>
  StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: config.backgroundColor,
      padding: config.padding,
      width: config.width,
      minHeight: "auto",
      fontSize: config.bodySize,
      fontFamily: "Helvetica", // Using built-in fonts only
    },
    header: {
      alignItems:
        config.logoPosition === "left" ? "flex-start" : config.logoPosition === "right" ? "flex-end" : "center",
      marginBottom: config.spacing * 2,
      paddingBottom: config.spacing,
      ...(config.showDivider && {
        borderBottomWidth: config.dividerWidth,
        borderBottomColor: config.primaryColor,
        borderBottomStyle: "solid",
      }),
    },
    companyName: {
      fontSize: config.titleSize,
      fontWeight: "bold",
      color: config.primaryColor,
      marginBottom: 2,
      textAlign: config.logoPosition,
      fontFamily: "Helvetica-Bold",
    },
    companyDetails: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      textAlign: config.logoPosition,
      marginBottom: 1,
    },
    invoiceTitle: {
      fontSize: config.headerSize,
      fontWeight: "bold",
      color: config.primaryColor,
      marginTop: config.spacing,
      marginBottom: config.spacing,
      textAlign: config.logoPosition,
      fontFamily: "Helvetica-Bold",
    },
    invoiceDetails: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      marginBottom: 1,
      textAlign: config.logoPosition,
    },
    section: {
      marginBottom: config.spacing * 1.5,
    },
    sectionTitle: {
      fontSize: config.headerSize - 2,
      fontWeight: "bold",
      color: config.primaryColor,
      marginBottom: config.spacing,
      textAlign: "left",
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    customerInfo: {
      marginBottom: config.spacing,
    },
    customerRow: {
      flexDirection: "row",
      marginBottom: 2,
    },
    customerLabel: {
      fontSize: config.bodySize,
      fontWeight: "bold",
      width: 50,
      color: config.primaryColor,
      fontFamily: "Helvetica-Bold",
    },
    customerValue: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      flex: 1,
    },
    table: {
      width: "100%",
    },
    tableHeader: {
      flexDirection: "row",
      paddingBottom: 2,
      marginBottom: 2,
      ...(config.showDivider && {
        borderBottomWidth: config.dividerWidth * 0.5,
        borderBottomColor: config.secondaryColor,
        borderBottomStyle: "solid",
      }),
    },
    tableHeaderCell: {
      fontSize: config.bodySize,
      fontWeight: "bold",
      color: config.primaryColor,
      fontFamily: "Helvetica-Bold",
    },
    tableRow: {
      flexDirection: "row",
      marginBottom: 2,
      alignItems: "flex-start",
    },
    itemName: {
      width: "50%",
      fontSize: config.bodySize,
      color: config.primaryColor,
    },
    itemQty: {
      width: "15%",
      fontSize: config.bodySize,
      color: config.secondaryColor,
      textAlign: "center",
    },
    itemPrice: {
      width: "17.5%",
      fontSize: config.bodySize,
      color: config.secondaryColor,
      textAlign: "right",
    },
    itemTotal: {
      width: "17.5%",
      fontSize: config.bodySize,
      color: config.primaryColor,
      textAlign: "right",
    },
    itemVariant: {
      fontSize: config.bodySize - 1,
      color: config.secondaryColor,
      marginTop: 1,
    },
    divider: {
      ...(config.showDivider && {
        borderTopWidth: config.dividerWidth,
        borderTopColor: config.primaryColor,
        borderTopStyle: "solid",
      }),
      marginVertical: config.spacing,
    },
    totalsSection: {
      marginTop: config.spacing,
    },
    totalsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    totalsLabel: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
    },
    totalsValue: {
      fontSize: config.bodySize,
      color: config.primaryColor,
      textAlign: "right",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: config.spacing,
      paddingTop: config.spacing,
      ...(config.showDivider && {
        borderTopWidth: config.dividerWidth,
        borderTopColor: config.primaryColor,
        borderTopStyle: "solid",
      }),
    },
    totalLabel: {
      fontSize: config.headerSize,
      fontWeight: "bold",
      color: config.primaryColor,
      fontFamily: "Helvetica-Bold",
    },
    totalValue: {
      fontSize: config.headerSize,
      fontWeight: "bold",
      color: config.primaryColor,
      textAlign: "right",
      fontFamily: "Helvetica-Bold",
    },
    paymentSection: {
      marginTop: config.spacing * 1.5,
      paddingTop: config.spacing,
      ...(config.showDivider && {
        borderTopWidth: config.dividerWidth,
        borderTopColor: config.primaryColor,
        borderTopStyle: "solid",
      }),
    },
    paymentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    paymentLabel: {
      fontSize: config.bodySize,
      color: config.primaryColor,
      fontWeight: "bold",
      fontFamily: "Helvetica-Bold",
    },
    paymentValue: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      textAlign: "right",
    },
    footer: {
      marginTop: config.spacing * 3,
      textAlign: "center",
      paddingTop: config.spacing * 2,
      ...(config.showDivider && {
        borderTopWidth: config.dividerWidth,
        borderTopColor: config.secondaryColor,
        borderTopStyle: "solid",
      }),
    },
    footerText: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      marginBottom: 2,
      textAlign: "center",
    },
    orderNotes: {
      marginTop: config.spacing * 1.5,
      paddingTop: config.spacing,
      ...(config.showDivider && {
        borderTopWidth: config.dividerWidth,
        borderTopColor: config.secondaryColor,
        borderTopStyle: "solid",
      }),
    },
    noteTitle: {
      fontSize: config.bodySize + 1,
      fontWeight: "bold",
      color: config.primaryColor,
      marginBottom: 2,
      fontFamily: "Helvetica-Bold",
    },
    noteText: {
      fontSize: config.bodySize,
      color: config.secondaryColor,
      marginBottom: config.spacing,
    },
    promoSection: {
      marginTop: config.spacing,
      paddingTop: config.spacing,
      ...(config.showDivider && {
        borderTopWidth: config.dividerWidth,
        borderTopColor: config.secondaryColor,
        borderTopStyle: "solid",
      }),
    },
    perforation: {
      marginTop: config.spacing * 2,
      borderTopStyle: "solid",
      borderTopWidth: 1,
      borderTopColor: config.secondaryColor,
      height: 10,
    },
  })

export interface EnhancedThermalReceiptPDFProps {
  items: CartItem[]
  paymentData: PaymentData
  qrCodeImage?: string
  organization: OrganizationData
  config: ReceiptConfig
  orderType?: "dine-in" | "takeaway" | "delivery"
  notes?: string
  promoCode?: string
  specialInstructions?: string
}

export const EnhancedThermalReceiptPDF = ({
  items,
  paymentData,
  organization,
  config,
  orderType,
  notes,
  promoCode,
  specialInstructions,
}: EnhancedThermalReceiptPDFProps) => {
  const styles = createStyles(config)
  const formatCurrency = useFormattedCurrency()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = config.showDiscount ? subtotal * 0.1 : 0
  const tax = config.showTax ? subtotal * 0.025 : 0
  const total = subtotal - discount + tax

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return (
    <Document>
      <Page size={[config.width, 600]} style={styles.page}>
        {/* Header */}
        {config.showHeader && (
          <View style={styles.header}>
            <Text style={styles.companyName}>{organization.name}</Text>
            {organization.tagline && <Text style={styles.companyDetails}>{organization.tagline}</Text>}
            <Text style={styles.companyDetails}>{organization.address}</Text>
            <Text style={styles.companyDetails}>Tel: {organization.phone}</Text>
            {organization.email && <Text style={styles.companyDetails}>Email: {organization.email}</Text>}
            {organization.website && <Text style={styles.companyDetails}>{organization.website}</Text>}

            <Text style={styles.invoiceTitle}>{config.receiptTitle}</Text>
            {config.showReceiptNumber && <Text style={styles.invoiceDetails}>Order: {paymentData.orderId}</Text>}
            {config.showDateTime && (
              <Text style={styles.invoiceDetails}>
                {currentDate} {currentTime}
              </Text>
            )}
            {orderType && config.showOrderType && (
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
                    <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                    <Text style={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
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
              <Text style={styles.totalsValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {config.showDiscount && discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount (10%):</Text>
                <Text style={styles.totalsValue}>-{formatCurrency(discount)}</Text>
              </View>
            )}
            {config.showTax && tax > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax (2.5%):</Text>
                <Text style={styles.totalsValue}>{formatCurrency(tax)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
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
                <Text style={styles.paymentValue}>{formatCurrency(paymentData.amountPaid)}</Text>
              </View>
            )}
            {config.showChange && paymentData.change > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Change:</Text>
                <Text style={styles.paymentValue}>{formatCurrency(paymentData.change)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Notes Section */}
        {config.showOrderNotes && notes && (
          <View style={styles.orderNotes}>
            <Text style={styles.noteTitle}>{config.notesTitle}</Text>
            <Text style={styles.noteText}>{notes}</Text>
          </View>
        )}

        {/* Special Instructions */}
        {config.showSpecialInstructions && specialInstructions && (
          <View style={styles.orderNotes}>
            <Text style={styles.noteTitle}>{config.instructionsTitle}</Text>
            <Text style={styles.noteText}>{specialInstructions}</Text>
          </View>
        )}

        {/* Promo Code Section */}
        {config.showPromoCode && promoCode && (
          <View style={styles.promoSection}>
            <Text style={styles.noteTitle}>{config.promoCodeText}</Text>
            <Text style={styles.noteText}>{promoCode}</Text>
          </View>
        )}

        {/* Footer */}
        {config.showFooter && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>{config.thankYouMessage}</Text>
            {organization.email && <Text style={styles.footerText}>Questions? Email: {organization.email}</Text>}
            <Text style={styles.footerText}>{config.footerText}</Text>
          </View>
        )}

        {/* Perforation */}
        {config.showPerforation && <View style={styles.perforation} />}
      </Page>
    </Document>
  );
}
