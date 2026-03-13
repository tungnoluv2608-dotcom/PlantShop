import { BrowserRouter, Routes, Route } from "react-router"
import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import ShopPage from './pages/ShopPage'
import NotFoundPage from './pages/NotFoundPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import PaymentFailedPage from './pages/PaymentFailedPage'
import ProfilePage from './pages/ProfilePage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import WholesalePage from './pages/WholesalePage'
import { ScrollToTop } from './components/ScrollToTop'
// Admin
import AdminLayout from './components/admin/AdminLayout'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminBlog from './pages/admin/AdminBlog'
import AdminCategories from './pages/admin/AdminCategories'
import AdminReviews from './pages/admin/AdminReviews'
import AdminPlanters from './pages/admin/AdminPlanters'
import { Toaster } from 'sonner'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Public / Shop routes */}
        <Route path='/' element={<HomePage />} />
        <Route path='/signin' element={<SignInPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/product/:id' element={<ProductPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/shop' element={<ShopPage />} />

        {/* Checkout flow */}
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/order-success/:orderId' element={<OrderSuccessPage />} />
        <Route path='/payment-failed' element={<PaymentFailedPage />} />

        {/* Brand content */}
        <Route path='/about' element={<AboutPage />} />
        <Route path='/blog' element={<BlogPage />} />
        <Route path='/blog/:id' element={<BlogDetailPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/wholesale' element={<WholesalePage />} />

        {/* User account */}
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/profile/orders' element={<ProfilePage />} />

        {/* ─── Admin ─── */}
        <Route path='/admin/login' element={<AdminLoginPage />} />
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path='products' element={<AdminProducts />} />
          <Route path='products/new' element={<AdminProductForm />} />
          <Route path='products/:id' element={<AdminProductForm />} />
          <Route path='orders' element={<AdminOrders />} />
          <Route path='orders/:id' element={<AdminOrderDetail />} />
          <Route path='customers' element={<AdminCustomers />} />
          <Route path='reviews' element={<AdminReviews />} />
          <Route path='categories' element={<AdminCategories />} />
          <Route path='planters' element={<AdminPlanters />} />
          <Route path='blog' element={<AdminBlog />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
