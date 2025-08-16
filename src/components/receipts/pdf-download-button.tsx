import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import type { ReceiptConfig, CartItem, PaymentData, OrganizationData } from "@/types"
import { toast } from "sonner"

interface PDFDownloadButtonProps {
  config: ReceiptConfig
  sampleItems: CartItem[]
  samplePaymentData: PaymentData
  sampleQRCode: string
}

export function PDFDownloadButton({ config, sampleItems, samplePaymentData, sampleQRCode }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadPDF = async () => {
    setIsGenerating(true)
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const { EnhancedThermalReceiptPDF } = await import("./enhanced-thermal-receipt-pdf")
      const { createElement } = await import("react")

      const organizationData: OrganizationData = {
        name: config.businessName,
        tagline: config.businessTagline,
        address: config.businessAddress,
        phone: config.businessPhone,
        email: config.businessEmail,
        website: config.businessWebsite,
      }

      const pdfElement = createElement(EnhancedThermalReceiptPDF, {
        items: sampleItems,
        paymentData: samplePaymentData,
        qrCodeImage: sampleQRCode,
        organization: organizationData,
        config: config,
        orderType: "dine-in" as const,
        notes: "Thank you for your order!",
        promoCode: "SAVE10",
        specialInstructions: "Extra hot, no sugar",
      })

      const blob = await pdf(pdfElement).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-${config.businessName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // toast("PDF Downloaded",{
      //   title: 
      //   description: "Your receipt PDF has been generated and downloaded successfully.",
      // })
    } catch (error) {
      console.error("Error generating PDF:", error)
      // toast({
      //   title: "PDF Generation Failed",
      //   description: "There was an error generating your receipt PDF. Please try again.",
      //   variant: "destructive",
      // })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={downloadPDF} className="w-full" size="lg" disabled={isGenerating}>
      {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
      {isGenerating ? "Generating PDF..." : "Download Test Receipt"}
    </Button>
  )
}
