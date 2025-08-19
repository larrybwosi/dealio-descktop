import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Settings,
  Palette,
  Layout,
  Type,
  FileText,
  Download,
  Save,
  Eye,
  Store,
  ImageIcon,
  Smartphone,
  CreditCard,
  QrCode,
  Receipt,
  Info,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import type { ReceiptConfig, CartItem, PaymentData } from "@/types"
import { ReceiptPreview } from "./receipt-preview"
import { toast } from "sonner"
import { PDFDownloadButton } from "./pdf-download-button"

const defaultConfig: ReceiptConfig = {
  // Basic Info
  businessName: "Your Business Name",
  businessTagline: "Quality Products & Services",
  businessAddress: "123 Main Street\nCity, State 12345",
  businessPhone: "(555) 123-4567",
  businessEmail: "contact@yourbusiness.com",
  businessWebsite: "www.yourbusiness.com",

  // Logo
  logoUrl: "",
  logoSize: 80,
  logoPosition: "center",

  // Colors
  primaryColor: "#000000",
  secondaryColor: "#666666",
  backgroundColor: "#ffffff",
  accentColor: "#007bff",

  // Typography
  headerFont: "Arial",
  bodyFont: "Arial",
  headerSize: 14,
  bodySize: 8,
  titleSize: 18,

  // Layout
  width: 226.77,
  padding: 8,
  spacing: 4,
  borderRadius: 0,
  showBorder: false,
  borderColor: "#000000",
  showDivider: true,
  dividerStyle: "solid",
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
  receiptTitle: "RECEIPT",
  thankYouMessage: "Thank you for your business!",
  footerText: "Keep this receipt for your records",
  qrCodeText: "Scan for Details",
  promoCodeText: "Promo Code Applied",
  notesTitle: "Order Notes",
  instructionsTitle: "Special Instructions",

  // Paper Style
  paperType: "thermal",
  showPerforation: true,
}

const sampleItems: CartItem[] = [
  { name: "Espresso", variant: "Double Shot", quantity: 2, price: 4.5 },
  { name: "Croissant", variant: "Almond", quantity: 1, price: 3.25 },
  { name: "Latte", addition: "Extra Foam", quantity: 1, price: 5.75 },
]

const samplePaymentData: PaymentData = {
  orderId: "ORD-2024-001",
  customerName: "John Doe",
  customerPhone: "(555) 123-4567",
  paymentMethod: "card",
  amountPaid: 15.5,
  change: 0,
}

const sampleQRCode =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

export function ReceiptCustomizer() {
  const [config, setConfig] = useState<ReceiptConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState("business")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadSavedConfig = () => {
      try {
        setIsLoading(true)
        const savedConfig = localStorage.getItem('receipt-config')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig) as ReceiptConfig
          setConfig(parsedConfig)
          toast.success('Configuration Loaded', {
            description: 'Your saved receipt settings have been loaded.',
          })
        }
      } catch (error) {
        console.error("Error loading configuration:", error)
        toast.error('Load Failed', {
          description: 'There was an error loading your saved configuration.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedConfig()
  }, [])

  const updateConfig = (key: keyof ReceiptConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "receipt-config.json"
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast.success("Configuration Exported",{
      description: "Your receipt configuration has been downloaded successfully.",
    })
  }

  const saveConfig = async () => {
    try {
      setIsLoading(true)
      console.log("Saving configuration:", config)
      localStorage.setItem('receipt-config', JSON.stringify(config))
      toast.success('Configuration Saved', {
        description: 'Your receipt settings have been saved successfully.',
      })
    } catch (error) {
      console.error("Error saving configuration:", error)
      toast.error('Save Failed', {
        description: 'There was an error saving your configuration.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetConfig = () => {
    if (window.confirm('Are you sure you want to reset to default configuration? This will discard all your changes.')) {
      setConfig(defaultConfig)
      toast.info('Configuration Reset', {
        description: 'Your receipt settings have been reset to default values.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2" 
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                Receipt Designer
              </h1>
            </div>
            <div className="w-[100px]"></div> {/* Empty div for balance */}
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center">
            Create beautiful, professional thermal receipts with our intuitive customization tools. Perfect for
            restaurants, retail stores, and service businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Customization Panel
              </CardTitle>
              <CardDescription>Configure every aspect of your receipt design and content</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="business" className="flex items-center gap-1">
                    <Store className="h-4 w-4" />
                    <span className="hidden sm:inline">Business</span>
                  </TabsTrigger>
                  <TabsTrigger value="design" className="flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Design</span>
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="flex items-center gap-1">
                    <Layout className="h-4 w-4" />
                    <span className="hidden sm:inline">Layout</span>
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Content</span>
                  </TabsTrigger>
                  <TabsTrigger value="fields" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Fields</span>
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[600px] pr-4">
                  {/* Business Information Tab */}
                  <TabsContent value="business" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Store className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Business Information</h3>
                      </div>

                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="businessName" className="text-sm font-medium">
                            Business Name <Badge variant="secondary">Required</Badge>
                          </Label>
                          <Input
                            id="businessName"
                            value={config.businessName}
                            onChange={(e) => updateConfig("businessName", e.target.value)}
                            placeholder="Enter your business name"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            This will appear prominently at the top of your receipt
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="businessTagline">Business Tagline</Label>
                          <Input
                            id="businessTagline"
                            value={config.businessTagline}
                            onChange={(e) => updateConfig("businessTagline", e.target.value)}
                            placeholder="Your business motto or tagline"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Optional tagline that appears below your business name
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="businessAddress">Address</Label>
                          <Textarea
                            id="businessAddress"
                            value={config.businessAddress}
                            onChange={(e) => updateConfig("businessAddress", e.target.value)}
                            placeholder="123 Main Street&#10;City, State 12345"
                            className="mt-1 min-h-[80px]"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Use line breaks for multi-line addresses</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="businessPhone">Phone Number</Label>
                            <Input
                              id="businessPhone"
                              value={config.businessPhone}
                              onChange={(e) => updateConfig("businessPhone", e.target.value)}
                              placeholder="(555) 123-4567"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="businessEmail">Email Address</Label>
                            <Input
                              id="businessEmail"
                              type="email"
                              value={config.businessEmail}
                              onChange={(e) => updateConfig("businessEmail", e.target.value)}
                              placeholder="contact@business.com"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="businessWebsite">Website</Label>
                          <Input
                            id="businessWebsite"
                            value={config.businessWebsite}
                            onChange={(e) => updateConfig("businessWebsite", e.target.value)}
                            placeholder="www.yourbusiness.com"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Logo Settings</h3>
                      </div>

                      <div>
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          value={config.logoUrl}
                          onChange={(e) => updateConfig("logoUrl", e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter a URL to your logo image (PNG, JPG, or SVG)
                        </p>
                      </div>

                      <div>
                        <Label>Logo Size: {config.logoSize}px</Label>
                        <Slider
                          value={[config.logoSize]}
                          onValueChange={(value) => updateConfig("logoSize", value[0])}
                          max={120}
                          min={40}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Logo Position</Label>
                        <Select
                          value={config.logoPosition}
                          onValueChange={(value) => updateConfig("logoPosition", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left Aligned</SelectItem>
                            <SelectItem value="center">Center Aligned</SelectItem>
                            <SelectItem value="right">Right Aligned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Design Tab */}
                  <TabsContent value="design" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Palette className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Color Scheme</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="primaryColor"
                              type="color"
                              value={config.primaryColor}
                              onChange={(e) => updateConfig("primaryColor", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={config.primaryColor}
                              onChange={(e) => updateConfig("primaryColor", e.target.value)}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Main text and headers</p>
                        </div>

                        <div>
                          <Label htmlFor="secondaryColor">Secondary Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="secondaryColor"
                              type="color"
                              value={config.secondaryColor}
                              onChange={(e) => updateConfig("secondaryColor", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={config.secondaryColor}
                              onChange={(e) => updateConfig("secondaryColor", e.target.value)}
                              placeholder="#666666"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Subtitles and details</p>
                        </div>

                        <div>
                          <Label htmlFor="backgroundColor">Background Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="backgroundColor"
                              type="color"
                              value={config.backgroundColor}
                              onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={config.backgroundColor}
                              onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                              placeholder="#ffffff"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Receipt background</p>
                        </div>

                        <div>
                          <Label htmlFor="accentColor">Accent Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="accentColor"
                              type="color"
                              value={config.accentColor}
                              onChange={(e) => updateConfig("accentColor", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={config.accentColor}
                              onChange={(e) => updateConfig("accentColor", e.target.value)}
                              placeholder="#007bff"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Highlights and buttons</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Type className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Typography</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Header Font</Label>
                          <Select
                            value={config.headerFont}
                            onValueChange={(value) => updateConfig("headerFont", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times">Times New Roman</SelectItem>
                              <SelectItem value="Courier">Courier New</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Body Font</Label>
                          <Select value={config.bodyFont} onValueChange={(value) => updateConfig("bodyFont", value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times">Times New Roman</SelectItem>
                              <SelectItem value="Courier">Courier New</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Title Size: {config.titleSize}px</Label>
                          <Slider
                            value={[config.titleSize]}
                            onValueChange={(value) => updateConfig("titleSize", value[0])}
                            max={24}
                            min={12}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Header Size: {config.headerSize}px</Label>
                          <Slider
                            value={[config.headerSize]}
                            onValueChange={(value) => updateConfig("headerSize", value[0])}
                            max={18}
                            min={8}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Body Size: {config.bodySize}px</Label>
                          <Slider
                            value={[config.bodySize]}
                            onValueChange={(value) => updateConfig("bodySize", value[0])}
                            max={12}
                            min={6}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Layout Tab */}
                  <TabsContent value="layout" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Layout className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Layout Settings</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Receipt Width: {config.width.toFixed(0)}px</Label>
                          <Slider
                            value={[config.width]}
                            onValueChange={(value) => updateConfig("width", value[0])}
                            max={300}
                            min={200}
                            step={5}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Standard thermal width is 226px (80mm)</p>
                        </div>

                        <div>
                          <Label>Padding: {config.padding}px</Label>
                          <Slider
                            value={[config.padding]}
                            onValueChange={(value) => updateConfig("padding", value[0])}
                            max={20}
                            min={4}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Spacing: {config.spacing}px</Label>
                          <Slider
                            value={[config.spacing]}
                            onValueChange={(value) => updateConfig("spacing", value[0])}
                            max={12}
                            min={2}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Borders & Dividers</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Border</Label>
                          <p className="text-xs text-muted-foreground">Add border around receipt</p>
                        </div>
                        <Switch
                          checked={config.showBorder}
                          onCheckedChange={(checked) => updateConfig("showBorder", checked)}
                        />
                      </div>

                      {config.showBorder && (
                        <div>
                          <Label htmlFor="borderColor">Border Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="borderColor"
                              type="color"
                              value={config.borderColor}
                              onChange={(e) => updateConfig("borderColor", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={config.borderColor}
                              onChange={(e) => updateConfig("borderColor", e.target.value)}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Dividers</Label>
                          <p className="text-xs text-muted-foreground">Add lines between sections</p>
                        </div>
                        <Switch
                          checked={config.showDivider}
                          onCheckedChange={(checked) => updateConfig("showDivider", checked)}
                        />
                      </div>

                      {config.showDivider && (
                        <div className="space-y-4">
                          <div>
                            <Label>Divider Style</Label>
                            <Select
                              value={config.dividerStyle}
                              onValueChange={(value) => updateConfig("dividerStyle", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="solid">Solid Line</SelectItem>
                                <SelectItem value="dashed">Dashed Line</SelectItem>
                                <SelectItem value="dotted">Dotted Line</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Divider Width: {config.dividerWidth}px</Label>
                            <Slider
                              value={[config.dividerWidth]}
                              onValueChange={(value) => updateConfig("dividerWidth", value[0])}
                              max={3}
                              min={0.5}
                              step={0.5}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Paper Style</h3>

                      <div>
                        <Label>Paper Type</Label>
                        <Select value={config.paperType} onValueChange={(value) => updateConfig("paperType", value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="thermal">Thermal Paper</SelectItem>
                            <SelectItem value="standard">Standard Paper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Perforation</Label>
                          <p className="text-xs text-muted-foreground">Add tear-off perforation line</p>
                        </div>
                        <Switch
                          checked={config.showPerforation}
                          onCheckedChange={(checked) => updateConfig("showPerforation", checked)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Text Content</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="receiptTitle">Receipt Title</Label>
                          <Input
                            id="receiptTitle"
                            value={config.receiptTitle}
                            onChange={(e) => updateConfig("receiptTitle", e.target.value)}
                            placeholder="RECEIPT"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Main title displayed on the receipt</p>
                        </div>

                        <div>
                          <Label htmlFor="thankYouMessage">Thank You Message</Label>
                          <Input
                            id="thankYouMessage"
                            value={config.thankYouMessage}
                            onChange={(e) => updateConfig("thankYouMessage", e.target.value)}
                            placeholder="Thank you for your business!"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="footerText">Footer Text</Label>
                          <Textarea
                            id="footerText"
                            value={config.footerText}
                            onChange={(e) => updateConfig("footerText", e.target.value)}
                            placeholder="Keep this receipt for your records"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="qrCodeText">QR Code Text</Label>
                          <Input
                            id="qrCodeText"
                            value={config.qrCodeText}
                            onChange={(e) => updateConfig("qrCodeText", e.target.value)}
                            placeholder="Scan for Details"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="promoCodeText">Promo Code Text</Label>
                          <Input
                            id="promoCodeText"
                            value={config.promoCodeText}
                            onChange={(e) => updateConfig("promoCodeText", e.target.value)}
                            placeholder="Promo Code Applied"
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="notesTitle">Notes Section Title</Label>
                            <Input
                              id="notesTitle"
                              value={config.notesTitle}
                              onChange={(e) => updateConfig("notesTitle", e.target.value)}
                              placeholder="Order Notes"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="instructionsTitle">Instructions Title</Label>
                            <Input
                              id="instructionsTitle"
                              value={config.instructionsTitle}
                              onChange={(e) => updateConfig("instructionsTitle", e.target.value)}
                              placeholder="Special Instructions"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Fields Tab */}
                  <TabsContent value="fields" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Eye className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Visible Sections</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Main Sections
                          </h4>

                          {[
                            { key: "showHeader", label: "Header Section", desc: "Business info and logo" },
                            { key: "showItemsSection", label: "Items Section", desc: "Ordered items and quantities" },
                            { key: "showTotalsSection", label: "Totals Section", desc: "Subtotal, tax, and total" },
                            { key: "showPaymentSection", label: "Payment Section", desc: "Payment method and change" },
                            { key: "showFooter", label: "Footer Section", desc: "Thank you message and contact info" },
                          ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <Label className="font-medium">{label}</Label>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                              </div>
                              <Switch
                                checked={config[key as keyof ReceiptConfig] as boolean}
                                onCheckedChange={(checked) => updateConfig(key as keyof ReceiptConfig, checked)}
                              />
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Receipt Fields
                          </h4>

                          {[
                            { key: "showDateTime", label: "Date & Time", icon: Info },
                            { key: "showReceiptNumber", label: "Receipt Number", icon: Receipt },
                            { key: "showOrderType", label: "Order Type", icon: Smartphone },
                            { key: "showCustomerInfo", label: "Customer Info", icon: Info },
                            { key: "showCashier", label: "Cashier Name", icon: Info },
                            { key: "showTax", label: "Tax Amount", icon: CreditCard },
                            { key: "showDiscount", label: "Discount Amount", icon: CreditCard },
                            { key: "showPaymentMethod", label: "Payment Method", icon: CreditCard },
                            { key: "showAmountReceived", label: "Amount Received", icon: CreditCard },
                            { key: "showChange", label: "Change Given", icon: CreditCard },
                            { key: "showQRCode", label: "QR Code", icon: QrCode },
                            { key: "showPromoCode", label: "Promo Code", icon: Info },
                            { key: "showSpecialInstructions", label: "Special Instructions", icon: FileText },
                            { key: "showOrderNotes", label: "Order Notes", icon: FileText },
                          ].map(({ key, label, icon: Icon }) => (
                            <div
                              key={key}
                              className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <Label className="cursor-pointer">{label}</Label>
                              </div>
                              <Switch
                                checked={config[key as keyof ReceiptConfig] as boolean}
                                onCheckedChange={(checked) => updateConfig(key as keyof ReceiptConfig, checked)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>

                {/* Action Buttons */}
                <div className="pt-6 border-t space-y-3">
                  <PDFDownloadButton
                    config={config}
                    sampleItems={sampleItems}
                    samplePaymentData={samplePaymentData}
                    sampleQRCode={sampleQRCode}
                  />
                  <Button 
                    onClick={saveConfig} 
                    variant="outline" 
                    className="w-full bg-transparent" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={exportConfig} variant="outline" className="bg-transparent" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={resetConfig} variant="outline" className="bg-transparent" size="lg">
                      <Settings className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See your receipt design in real-time as you make changes. Click "Download Test Receipt" to get a PDF
                with sample data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-8 rounded-xl">
                <div className="flex justify-center">
                  <ReceiptPreview config={config} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
