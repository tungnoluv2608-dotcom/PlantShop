import { BrowserRouter, Routes, Route } from "react-router"
import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import ShopPage from './pages/ShopPage'
import NotFoundPage from './pages/NotFoundPage'
import { ScrollToTop } from './components/ScrollToTop'
import {Toaster} from "sonner"

function App() {

  return <>
    <BrowserRouter>
      <ScrollToTop />
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<HomePage />} />
        <Route path='/signin' element={<SignInPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/product/:id' element={<ProductPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/shop' element={<ShopPage />} />

        {/* Protected routes */}

        {/* Catch-all 404 */}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>


    </BrowserRouter>
  </>
}

export default App
