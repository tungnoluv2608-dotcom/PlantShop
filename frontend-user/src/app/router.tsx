import { createBrowserRouter } from "react-router"
import { RootLayout } from "@/app/layout/RootLayout"
import { NotFoundPage } from "@/features/misc/NotFoundPage"
import { HomePage } from "@/features/catalog/pages/HomePage"
import { ShopPage } from "@/features/catalog/pages/ShopPage"
import { ProductDetailPage } from "@/features/product/pages/ProductDetailPage"
import { PlantersPage } from "@/features/planters/pages/PlantersPage"
import { AccessoriesPage } from "@/features/planters/pages/AccessoriesPage"
import { PlanterDetailPage } from "@/features/planters/pages/PlanterDetailPage"
import { BlogListPage } from "@/features/blog/pages/BlogListPage"
import { BlogDetailPage } from "@/features/blog/pages/BlogDetailPage"
import { AdvisorPage } from "@/features/advisor/pages/AdvisorPage"
import { AdvisorHistoryPage } from "@/features/advisor/pages/AdvisorHistoryPage"
import { WholesalePage } from "@/features/wholesale/pages/WholesalePage"
import { CartPage } from "@/features/cart/pages/CartPage"
import { CheckoutPage } from "@/features/checkout/pages/CheckoutPage"
import { OrderSuccessPage } from "@/features/orders/pages/OrderSuccessPage"
import { OrderDetailPage } from "@/features/orders/pages/OrderDetailPage"
import { ProfilePage } from "@/features/profile/pages/ProfilePage"
import { WishlistPage } from "@/features/wishlist/pages/WishlistPage"
import { SignInPage } from "@/features/auth/pages/SignInPage"
import { SignUpPage } from "@/features/auth/pages/SignUpPage"
import { VnpayReturnPage } from "@/features/payment/pages/VnpayReturnPage"
import { PayosReturnPage } from "@/features/payment/pages/PayosReturnPage"
import { PayosCancelPage } from "@/features/payment/pages/PayosCancelPage"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/shop", element: <ShopPage /> },
      { path: "/product/:id", element: <ProductDetailPage /> },
      { path: "/planters", element: <PlantersPage /> },
      { path: "/planters/:id", element: <PlanterDetailPage type="planter" /> },
      { path: "/accessories", element: <AccessoriesPage /> },
      { path: "/accessories/:id", element: <PlanterDetailPage type="accessory" /> },
      { path: "/blog", element: <BlogListPage /> },
      { path: "/blog/:id", element: <BlogDetailPage /> },
      { path: "/advisor", element: <AdvisorPage /> },
      { path: "/wholesale", element: <WholesalePage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/signin", element: <SignInPage /> },
      { path: "/signup", element: <SignUpPage /> },
      { path: "/payment/vnpay-return", element: <VnpayReturnPage /> },
      { path: "/payment/payos-return", element: <PayosReturnPage /> },
      { path: "/payment/payos-cancel", element: <PayosCancelPage /> },

      // Authenticated customer area
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/order-success/:orderId", element: <OrderSuccessPage /> },
          { path: "/orders/:id", element: <OrderDetailPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/wishlist", element: <WishlistPage /> },
          { path: "/advisor/history", element: <AdvisorHistoryPage /> },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
