export interface PaymentData {
  orderId: string
  customerName?: string
  customerPhone?: string
  paymentMethod: "cash" | "card" | "mobile"
  amountPaid: number
  change: number
}

export interface CartItem {
  name: string
  price: number
  quantity: number
  variant?: string
  addition?: string
}
