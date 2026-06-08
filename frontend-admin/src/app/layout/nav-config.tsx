import {
  LayoutDashboard,
  Package,
  FolderTree,
  Flower2,
  Wrench,
  ShoppingCart,
  TicketPercent,
  Truck,
  Users,
  Star,
  Newspaper,
  Building2,
  Printer,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  to: string
  icon: LucideIcon
  /** Extra path prefixes that should also mark this item active. */
  matchPrefixes?: string[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [{ title: "Bảng điều khiển", to: "/", icon: LayoutDashboard }],
  },
  {
    label: "Bán hàng",
    items: [
      {
        title: "Đơn hàng",
        to: "/orders",
        icon: ShoppingCart,
        matchPrefixes: ["/orders"],
      },
      {
        title: "Voucher",
        to: "/vouchers",
        icon: TicketPercent,
        matchPrefixes: ["/vouchers"],
      },
      {
        title: "Vùng vận chuyển",
        to: "/shipping-zones",
        icon: Truck,
        matchPrefixes: ["/shipping-zones"],
      },
      { title: "Khách hàng", to: "/customers", icon: Users },
      {
        title: "Mua sỉ / B2B",
        to: "/wholesale",
        icon: Building2,
        matchPrefixes: ["/wholesale"],
      },
      {
        title: "Cài đặt in ấn",
        to: "/print-settings",
        icon: Printer,
        matchPrefixes: ["/print-settings"],
      },
    ],
  },
  {
    label: "Danh mục",
    items: [
      {
        title: "Sản phẩm",
        to: "/products",
        icon: Package,
        matchPrefixes: ["/products"],
      },
      { title: "Danh mục", to: "/categories", icon: FolderTree },
      { title: "Chậu cây", to: "/planters", icon: Flower2 },
      { title: "Phụ kiện", to: "/accessories", icon: Wrench },
    ],
  },
  {
    label: "Nội dung",
    items: [
      {
        title: "Góc xanh",
        to: "/blog",
        icon: Newspaper,
        matchPrefixes: ["/blog"],
      },
      { title: "Đánh giá", to: "/reviews", icon: Star },
    ],
  },
]
