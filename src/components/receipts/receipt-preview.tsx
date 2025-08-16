import type { ReceiptConfig } from "@/types"

interface ReceiptPreviewProps {
  config: ReceiptConfig
}

export function ReceiptPreview({ config }: ReceiptPreviewProps) {
  const mockItems = [
    { name: "Coffee Latte", price: 4.5, quantity: 2, variant: "Large" },
    { name: "Blueberry Muffin", price: 3.25, quantity: 1 },
    { name: "Sandwich", price: 8.75, quantity: 1, variant: "Turkey Club", addition: "Extra Cheese" },
  ]

  const subtotal = mockItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = config.showDiscount ? subtotal * 0.1 : 0
  const tax = config.showTax ? subtotal * 0.08 : 0
  const total = subtotal - discount + tax

  const currentDate = new Date().toLocaleDateString()
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div
      className="bg-white shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        width: `${config.width}px`,
        backgroundColor: config.backgroundColor,
        borderRadius: `${config.borderRadius}px`,
        border: config.showBorder ? `1px solid ${config.borderColor}` : "none",
        fontFamily: config.bodyFont,
        fontSize: `${config.bodySize}px`,
        padding: `${config.padding}px`,
      }}
    >
      {/* Perforation */}
      {config.showPerforation && (
        <div
          className="w-full h-2 bg-repeat-x mb-2"
          style={{
            backgroundImage: `radial-gradient(circle, ${config.borderColor} 1px, transparent 1px)`,
            backgroundSize: "8px 2px",
          }}
        />
      )}

      {/* Header */}
      {config.showHeader && (
        <div className="text-center mb-4">
          {config.logoUrl && (
            <div
              className={`mb-2 flex ${config.logoPosition === "left" ? "justify-start" : config.logoPosition === "right" ? "justify-end" : "justify-center"}`}
            >
              <img
                src={config.logoUrl || "/placeholder.svg"}
                alt="Logo"
                style={{ width: `${config.logoSize}px`, height: `${config.logoSize}px` }}
                className="object-contain"
              />
            </div>
          )}

          <div
            style={{
              fontSize: `${config.titleSize}px`,
              color: config.primaryColor,
              fontFamily: config.headerFont,
              fontWeight: "bold",
              marginBottom: `${config.spacing}px`,
            }}
          >
            {config.businessName}
          </div>

          {config.businessTagline && (
            <div style={{ color: config.secondaryColor, marginBottom: `${config.spacing}px` }}>
              {config.businessTagline}
            </div>
          )}

          <div style={{ color: config.secondaryColor, fontSize: `${config.bodySize}px` }}>
            {config.businessAddress.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div style={{ color: config.secondaryColor, fontSize: `${config.bodySize}px` }}>
            Tel: {config.businessPhone}
          </div>

          {config.businessEmail && (
            <div style={{ color: config.secondaryColor, fontSize: `${config.bodySize}px` }}>
              Email: {config.businessEmail}
            </div>
          )}

          {config.businessWebsite && (
            <div style={{ color: config.secondaryColor, fontSize: `${config.bodySize}px` }}>
              {config.businessWebsite}
            </div>
          )}
        </div>
      )}

      {config.showDivider && config.showHeader && (
        <div
          style={{
            borderTop: `${config.dividerWidth}px ${config.dividerStyle} ${config.borderColor}`,
            margin: `${config.spacing}px 0`,
          }}
        />
      )}

      {/* Receipt Title and Info */}
      <div className="text-center mb-4">
        <div
          style={{
            fontSize: `${config.headerSize}px`,
            color: config.primaryColor,
            fontWeight: "bold",
            marginBottom: `${config.spacing}px`,
          }}
        >
          {config.receiptTitle}
        </div>

        {config.showReceiptNumber && <div style={{ color: config.secondaryColor }}>Order: #12345</div>}

        {config.showDateTime && (
          <div style={{ color: config.secondaryColor }}>
            {currentDate} {currentTime}
          </div>
        )}

        {config.showOrderType && <div style={{ color: config.secondaryColor }}>Order Type: Dine-in</div>}

        {config.showCashier && <div style={{ color: config.secondaryColor }}>Cashier: John D.</div>}
      </div>

      {/* Customer Info */}
      {config.showCustomerInfo && (
        <>
          {config.showDivider && (
            <div
              style={{
                borderTop: `${config.dividerWidth}px ${config.dividerStyle} ${config.borderColor}`,
                margin: `${config.spacing}px 0`,
              }}
            />
          )}
          <div className="mb-4">
            <div style={{ color: config.primaryColor, fontWeight: "bold", marginBottom: `${config.spacing}px` }}>
              CUSTOMER
            </div>
            <div style={{ color: config.secondaryColor }}>Name: John Smith</div>
            <div style={{ color: config.secondaryColor }}>Phone: (555) 123-4567</div>
          </div>
        </>
      )}

      {/* Items Section */}
      {config.showItemsSection && (
        <>
          {config.showDivider && (
            <div
              style={{
                borderTop: `${config.dividerWidth}px ${config.dividerStyle} ${config.borderColor}`,
                margin: `${config.spacing}px 0`,
              }}
            />
          )}

          <div className="mb-4">
            <div style={{ color: config.primaryColor, fontWeight: "bold", marginBottom: `${config.spacing}px` }}>
              ITEMS
            </div>

            {/* Table Header */}
            <div className="flex justify-between mb-2" style={{ color: config.primaryColor, fontWeight: "bold" }}>
              <span style={{ width: "50%" }}>Item</span>
              <span style={{ width: "15%", textAlign: "center" }}>Qty</span>
              <span style={{ width: "17.5%", textAlign: "right" }}>Price</span>
              <span style={{ width: "17.5%", textAlign: "right" }}>Total</span>
            </div>

            {/* Items */}
            {mockItems.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between" style={{ color: config.primaryColor }}>
                  <div style={{ width: "50%" }}>
                    <div>{item.name}</div>
                    {item.variant && (
                      <div style={{ color: config.secondaryColor, fontSize: `${config.bodySize - 1}px` }}>
                        {item.variant}
                      </div>
                    )}
                    {item.addition && (
                      <div style={{ color: config.secondaryColor, fontSize: `${config.bodySize - 1}px` }}>
                        + {item.addition}
                      </div>
                    )}
                  </div>
                  <span style={{ width: "15%", textAlign: "center" }}>{item.quantity}</span>
                  <span style={{ width: "17.5%", textAlign: "right" }}>${item.price.toFixed(2)}</span>
                  <span style={{ width: "17.5%", textAlign: "right" }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Totals Section */}
      {config.showTotalsSection && (
        <>
          {config.showDivider && (
            <div
              style={{
                borderTop: `${config.dividerWidth}px ${config.dividerStyle} ${config.borderColor}`,
                margin: `${config.spacing}px 0`,
              }}
            />
          )}

          <div className="mb-4">
            <div className="flex justify-between mb-1" style={{ color: config.secondaryColor }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {config.showDiscount && (
              <div className="flex justify-between mb-1" style={{ color: config.secondaryColor }}>
                <span>Discount (10%):</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            {config.showTax && (
              <div className="flex justify-between mb-1" style={{ color: config.secondaryColor }}>
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            )}

            <div
              className="flex justify-between pt-2"
              style={{
                color: config.primaryColor,
                fontWeight: "bold",
                fontSize: `${config.headerSize}px`,
                borderTop: `${config.dividerWidth}px solid ${config.borderColor}`,
              }}
            >
              <span>TOTAL:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}

      {/* Payment Section */}
      {config.showPaymentSection && (
        <>
          {config.showDivider && (
            <div
              style={{
                borderTop: `${config.dividerWidth}px ${config.dividerStyle} ${config.borderColor}`,
                margin: `${config.spacing}px 0`,
              }}
            />
          )}

          <div className="mb-4">
            <div style={{ color: config.primaryColor, fontWeight: "bold", marginBottom: `${config.spacing}px` }}>
              PAYMENT
            </div>

            {config.showPaymentMethod && (
              <div className="flex justify-between mb-1" style={{ color: config.secondaryColor }}>
                <span>Method:</span>
                <span>Cash</span>
              </div>
            )}

            {config.showAmountReceived && (
              <div className="flex justify-between mb-1" style={{ color: config.secondaryColor }}>
                <span>Paid:</span>
                <span>${(total + 5).toFixed(2)}</span>
              </div>
            )}

            {config.showChange && (
              <div className="flex justify-between mb-1" style={{ color: config.secondaryColor }}>
                <span>Change:</span>
                <span>$5.00</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Notes and Instructions */}
      {(config.showOrderNotes || config.showSpecialInstructions) && (
        <>
          {config.showDivider && (
            <div
              style={{
                borderTop: `${config.dividerWidth}px dashed ${config.borderColor}`,
                margin: `${config.spacing}px 0`,
              }}
            />
          )}

          <div className="mb-4">
            {config.showOrderNotes && (
              <div className="mb-2">
                <div style={{ color: config.primaryColor, fontWeight: "bold", marginBottom: "2px" }}>
                  {config.notesTitle}
                </div>
                <div style={{ color: config.secondaryColor }}>Extra hot, no foam</div>
              </div>
            )}

            {config.showSpecialInstructions && (
              <div className="mb-2">
                <div style={{ color: config.primaryColor, fontWeight: "bold", marginBottom: "2px" }}>
                  {config.instructionsTitle}
                </div>
                <div style={{ color: config.secondaryColor }}>Please call when ready for pickup</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Promo Code */}
      {config.showPromoCode && (
        <>
          {config.showDivider && (
            <div
              style={{
                borderTop: `${config.dividerWidth}px dashed ${config.borderColor}`,
                margin: `${config.spacing}px 0`,
              }}
            />
          )}

          <div className="mb-4">
            <div style={{ color: config.primaryColor, fontWeight: "bold", marginBottom: "2px" }}>
              {config.promoCodeText}
            </div>
            <div style={{ color: config.secondaryColor }}>SAVE10 - 10% Off</div>
          </div>
        </>
      )}

      {/* QR Code */}
      {config.showQRCode && (
        <>
          {config.showDivider && (
            <div
              style={{
                borderTop: `${config.dividerWidth}px dashed ${config.borderColor}`,
                margin: `${config.spacing}px 0`,
              }}
            />
          )}

          <div className="text-center mb-4">
            <div style={{ color: config.primaryColor, fontWeight: "bold", marginBottom: `${config.spacing}px` }}>
              {config.qrCodeText}
            </div>
            <div className="flex justify-center mb-2">
              <div
                className="bg-black"
                style={{
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="text-white text-xs">QR</div>
              </div>
            </div>
            <div style={{ color: config.secondaryColor, fontSize: `${config.bodySize - 1}px` }}>Order ID: #12345</div>
          </div>
        </>
      )}

      {/* Footer */}
      {config.showFooter && (
        <>
          {config.showDivider && (
            <div
              style={{
                borderTop: `${config.dividerWidth}px dashed ${config.borderColor}`,
                margin: `${config.spacing}px 0`,
              }}
            />
          )}

          <div className="text-center">
            <div style={{ color: config.primaryColor, fontWeight: "bold", marginBottom: `${config.spacing}px` }}>
              {config.thankYouMessage}
            </div>
            {config.businessEmail && (
              <div style={{ color: config.secondaryColor, marginBottom: "2px" }}>
                Questions? Email: {config.businessEmail}
              </div>
            )}
            <div style={{ color: config.secondaryColor }}>{config.footerText}</div>
          </div>
        </>
      )}

      {/* Bottom Perforation */}
      {config.showPerforation && (
        <div
          className="w-full h-2 bg-repeat-x mt-4"
          style={{
            backgroundImage: `radial-gradient(circle, ${config.borderColor} 1px, transparent 1px)`,
            backgroundSize: "8px 2px",
          }}
        />
      )}
    </div>
  )
}
