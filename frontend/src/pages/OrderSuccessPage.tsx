import { Link, useParams } from "react-router";
import { CheckCircle, ShoppingBag, ArrowRight, Plant, Leaf } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { products } from "../data/mockData";

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const suggestedProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Success Hero */}
        <div className="bg-white rounded-3xl shadow-sm border border-secondary p-8 md:p-12 text-center mb-8 relative overflow-hidden">
          {/* Decorative leaves */}
          <div className="absolute top-4 left-4 opacity-10"><Leaf size={80} className="text-primary" weight="fill" /></div>
          <div className="absolute bottom-4 right-4 opacity-10"><Plant size={80} className="text-primary" weight="fill" /></div>

          {/* Animated checkmark */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={56} className="text-green-600" weight="fill" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            Đặt hàng thành công! 🌿
          </h1>
          <p className="text-foreground/60 text-lg mb-6 max-w-md mx-auto">
            Cảm ơn bạn đã tin tưởng <span className="font-bold text-primary">Plan A Plant</span>. Đơn hàng của bạn đang được chuẩn bị.
          </p>

          {/* Order ID */}
          <div className="inline-flex items-center gap-3 bg-secondary/40 px-6 py-3 rounded-full mb-4">
            <span className="text-foreground/60 text-sm font-medium">Mã đơn hàng:</span>
            <span className="font-black text-primary tracking-widest text-sm">{orderId}</span>
          </div>

          {/* Estimated delivery */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 mt-6 text-left">
            <h3 className="font-bold text-foreground mb-3">Thông tin giao hàng dự kiến</h3>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Phương thức:</span>
                  <span className="font-semibold">Giao hàng tiêu chuẩn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Dự kiến nhận hàng:</span>
                  <span className="font-semibold text-primary">3-5 ngày làm việc</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-foreground/50 mt-3 italic">
              📦 Cây sẽ được đóng gói cẩn thận trước khi giao. Bạn sẽ nhận SMS xác nhận khi hàng được giao cho đơn vị vận chuyển.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link to="/profile/orders"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5">
            <ShoppingBag size={20} weight="fill" />
            Xem đơn hàng của tôi
          </Link>
          <Link to="/shop"
            className="flex items-center justify-center gap-2 bg-white text-primary py-4 rounded-2xl font-bold border-2 border-primary hover:bg-primary/5 transition-all">
            Tiếp tục mua sắm
            <ArrowRight size={20} weight="bold" />
          </Link>
        </div>

        {/* Recommended Products */}
        <div>
          <h2 className="text-xl font-bold mb-5 text-foreground">Bạn có thể thích</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-secondary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="aspect-square overflow-hidden">
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{product.title}</p>
                  <p className="text-primary font-bold text-sm mt-1">{product.price.toLocaleString("vi-VN")}đ</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
