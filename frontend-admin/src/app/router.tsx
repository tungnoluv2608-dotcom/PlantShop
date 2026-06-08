import { createBrowserRouter } from "react-router"
import { AdminLayout } from "@/app/layout/AdminLayout"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { NotFoundPage } from "@/features/misc/NotFoundPage"
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage"
import { ProductListPage } from "@/features/products/pages/ProductListPage"
import { ProductCreatePage } from "@/features/products/pages/ProductCreatePage"
import { ProductEditPage } from "@/features/products/pages/ProductEditPage"
import { CategoryListPage } from "@/features/categories/pages/CategoryListPage"
import { PlanterListPage } from "@/features/planters/pages/PlanterListPage"
import { AccessoryListPage } from "@/features/planters/pages/AccessoryListPage"
import { BlogListPage } from "@/features/blog/pages/BlogListPage"
import { BlogCreatePage } from "@/features/blog/pages/BlogCreatePage"
import { BlogEditPage } from "@/features/blog/pages/BlogEditPage"
import { OrderListPage } from "@/features/orders/pages/OrderListPage"
import { OrderDetailPage } from "@/features/orders/pages/OrderDetailPage"
import { CustomerListPage } from "@/features/customers/pages/CustomerListPage"
import { ReviewListPage } from "@/features/reviews/pages/ReviewListPage"
import { WholesaleListPage } from "@/features/wholesale/pages/WholesaleListPage"
import { WholesaleDetailPage } from "@/features/wholesale/pages/WholesaleDetailPage"
import { PrintSettingsPage } from "@/features/print-settings/pages/PrintSettingsPage"
import { VoucherListPage } from "@/features/vouchers/pages/VoucherListPage"
import { VoucherDetailPage } from "@/features/vouchers/pages/VoucherDetailPage"
import { ShippingZoneListPage } from "@/features/shipping-zones/pages/ShippingZoneListPage"

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },

          { path: "/products", element: <ProductListPage /> },
          { path: "/products/new", element: <ProductCreatePage /> },
          { path: "/products/:id/edit", element: <ProductEditPage /> },

          { path: "/categories", element: <CategoryListPage /> },
          { path: "/planters", element: <PlanterListPage /> },
          { path: "/accessories", element: <AccessoryListPage /> },

          { path: "/blog", element: <BlogListPage /> },
          { path: "/blog/new", element: <BlogCreatePage /> },
          { path: "/blog/:id/edit", element: <BlogEditPage /> },

          { path: "/orders", element: <OrderListPage /> },
          { path: "/orders/:id", element: <OrderDetailPage /> },
          { path: "/vouchers", element: <VoucherListPage /> },
          { path: "/vouchers/:id", element: <VoucherDetailPage /> },
          { path: "/shipping-zones", element: <ShippingZoneListPage /> },
          { path: "/print-settings", element: <PrintSettingsPage /> },

          { path: "/customers", element: <CustomerListPage /> },
          { path: "/reviews", element: <ReviewListPage /> },

          { path: "/wholesale", element: <WholesaleListPage /> },
          { path: "/wholesale/:id", element: <WholesaleDetailPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
