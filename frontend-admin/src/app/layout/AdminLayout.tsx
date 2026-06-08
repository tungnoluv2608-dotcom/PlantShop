import { Fragment } from "react"
import { Outlet, useLocation, Link } from "react-router"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AppSidebar } from "./AppSidebar"
import { useRouteProgress } from "./useRouteProgress"
import { NAV_GROUPS } from "./nav-config"

/** Maps a top-level path segment to a human label using the nav config. */
const SEGMENT_LABELS: Record<string, string> = {
  "": "Bảng điều khiển",
  products: "Sản phẩm",
  categories: "Danh mục",
  planters: "Chậu cây",
  accessories: "Phụ kiện",
  orders: "Đơn hàng",
  vouchers: "Voucher",
  "shipping-zones": "Vùng vận chuyển",
  customers: "Khách hàng",
  reviews: "Đánh giá",
  blog: "Góc xanh",
  wholesale: "Mua sỉ / B2B",
  "print-settings": "Cài đặt in ấn",
  new: "Tạo mới",
  edit: "Chỉnh sửa",
}

function labelFor(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment]
  // numeric / id segment
  return decodeURIComponent(segment)
}

function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)

  const rootLabel =
    NAV_GROUPS[0]?.items[0]?.title ?? "Bảng điều khiển"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {segments.length === 0 ? (
            <BreadcrumbPage>{rootLabel}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to="/">{rootLabel}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1
          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{labelFor(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href}>{labelFor(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function AdminLayout() {
  useRouteProgress()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-5" />
          <Breadcrumbs />
        </header>
        <div className="flex-1 space-y-6 p-4 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
