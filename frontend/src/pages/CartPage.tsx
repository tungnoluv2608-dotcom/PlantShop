import { Link } from "react-router";
import { Trash, Plus, Minus, ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { useCartStore } from "../stores/cartStore";
import { toast } from "sonner";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const shipping = useCartStore((s) => s.shipping());
  const total = useCartStore((s) => s.totalPrice());

  const handleRemove = (id: string, title: string) => {
    removeItem(id);
    toast.info("Đã xóa khỏi giỏ hàng", {
      description: title,
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black text-foreground mb-8">Giỏ hàng của bạn</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-secondary">
            <h2 className="text-2xl font-bold mb-4">Giỏ hàng trốn đi đâu mất rồi?</h2>
            <p className="text-foreground/70 mb-8 max-w-md mx-auto">Có vẻ như bạn chưa thêm cây xanh nào vào giỏ. Khám phá các loại cây tuyệt đẹp của chúng tôi ngay nhé!</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5"
            >
              Tiếp tục mua sắm
              <ArrowRight weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Cart Items List */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-secondary overflow-hidden">
                {/* List Header */}
                <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b border-secondary bg-gray-50/50 text-sm font-semibold text-foreground/70 uppercase tracking-wider text-center">
                  <div className="col-span-6 text-left">Sản phẩm</div>
                  <div className="col-span-2">Đơn giá</div>
                  <div className="col-span-2">Số lượng</div>
                  <div className="col-span-2 text-right">Tổng</div>
                </div>

                {/* Items */}
                <div className="divide-y divide-secondary">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center sm:items-start text-center sm:text-left transition-colors hover:bg-gray-50/30">
                      
                      {/* Product Info */}
                      <div className="col-span-6 w-full flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <Link to={`/product/${item.id}`} className="shrink-0 group cursor-pointer">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        </Link>
                        <div className="flex flex-col justify-center h-full gap-1">
                          <Link to={`/product/${item.id}`} className="font-bold text-lg hover:text-primary transition-colors text-foreground">
                            {item.title}
                          </Link>
                          <p className="text-sm text-foreground/70">Chậu: {item.planter}</p>
                          <button 
                            onClick={() => handleRemove(item.id, item.title)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center justify-center sm:justify-start gap-1 mt-2 transition-colors font-medium w-max cursor-pointer"
                          >
                            <Trash size={16} /> Bỏ khỏi giỏ
                          </button>
                        </div>
                      </div>

                      {/* Price (Mobile hidden, Grid shown) */}
                      <div className="col-span-2 sm:flex flex-col hidden justify-center h-full font-medium text-foreground">
                        {item.price.toLocaleString('vi-VN')} đ
                      </div>

                      {/* Quantity Control */}
                      <div className="col-span-2 w-full flex justify-center items-center h-full">
                        <div className="inline-flex items-center border border-secondary rounded-lg bg-white overflow-hidden shadow-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="p-2 hover:bg-secondary/50 text-foreground transition-colors cursor-pointer"
                          >
                            <Minus size={14} weight="bold" />
                          </button>
                          <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="p-2 hover:bg-secondary/50 text-foreground transition-colors cursor-pointer"
                          >
                            <Plus size={14} weight="bold" />
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="col-span-2 w-full flex sm:justify-end justify-center items-center h-full">
                        <span className="font-bold text-lg text-primary block sm:hidden mr-2">Tổng: </span>
                        <span className="font-bold text-lg text-primary">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-white rounded-2xl shadow-xl border border-secondary p-6 sticky top-28">
                <h2 className="text-xl font-bold mb-6 text-foreground border-b border-border pb-4">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-foreground/80">
                    <span>Tạm tính</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium">{shipping.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-foreground font-bold">Tổng cộng</span>
                    <span className="text-2xl font-black text-primary">{total.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <p className="text-xs text-foreground/60 text-right mt-1">(Đã bao gồm VAT nếu có)</p>
                </div>

                <button className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5 mb-4 group flex justify-center items-center gap-2 cursor-pointer">
                  Tiến hành Thanh toán
                  <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-2 text-sm text-foreground/70 font-medium">
                  <ShieldCheck size={20} className="text-green-600" />
                  Thanh toán an toàn 100%
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
