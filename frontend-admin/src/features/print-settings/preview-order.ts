import type { AdminOrderDetail } from "@/types"

/** Sample order used for print preview on the settings page. */
export const PRINT_PREVIEW_ORDER: AdminOrderDetail = {
  id: "PSTT-2026-PREVIEW",
  date: new Date().toISOString().slice(0, 10),
  status: "packing",
  shippingAddress: "123 Đường Xanh, Phường B, Quận 1, TP. Hồ Chí Minh",
  paymentMethod: "cod",
  subtotal: 420000,
  shippingFee: 30000,
  total: 450000,
  shippingMethod: "standard",
  recipientName: "Nguyễn Văn A",
  recipientPhone: "0901234567",
  province: "TP. Hồ Chí Minh",
  district: "Quận 1",
  ward: "Phường B",
  addressLine: "123 Đường Xanh",
  internalNote: null,
  items: [
    {
      id: "1",
      title: "Monstera deliciosa",
      price: 280000,
      quantity: 1,
      image: "",
      planter: "Chậu terrazzo 20cm",
    },
    {
      id: "2",
      title: "Lavender",
      price: 70000,
      quantity: 2,
      image: "",
      planter: "",
    },
  ],
  timeline: [],
}