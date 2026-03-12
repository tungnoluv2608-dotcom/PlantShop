import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  CaretLeft, CaretRight, CheckCircle, MapPin, Truck,
  CreditCard, ShieldCheck, Package, Clock
} from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { useCartStore } from "../stores/cartStore";

const steps = ["Giỏ hàng", "Thông tin giao hàng", "Thanh toán", "Xác nhận"];

const provinces = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Bình Dương", "Đồng Nai"];
const districtsByProvince: Record<string, string[]> = {
  "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 5", "Quận 7", "Thủ Đức", "Bình Thạnh", "Gò Vấp"],
  "Hà Nội": ["Hoàn Kiếm", "Ba Đình", "Đống Đa", "Hai Bà Trưng", "Cầu Giấy"],
  default: ["Quận/Huyện 1", "Quận/Huyện 2"],
};

const shippingMethods = [
  { id: "standard", label: "Giao hàng Tiêu chuẩn", time: "3-5 ngày làm việc", price: 0, note: "Miễn phí từ 500.000đ" },
  { id: "express", label: "Giao hàng Nhanh", time: "1-2 ngày làm việc", price: 30000, note: "GHN / GHTK" },
  { id: "sameday", label: "Giao hàng Hỏa tốc", time: "Trong ngày", price: 60000, note: "Chỉ nội thành TP.HCM & HN" },
];

const paymentMethods = [
  { id: "cod", label: "Tiền mặt khi nhận (COD)", icon: "💵", desc: "Thanh toán khi nhận hàng" },
  { id: "momo", label: "Ví MoMo", icon: "📱", desc: "Quét QR hoặc số điện thoại" },
  { id: "vnpay", label: "VNPay", icon: "🏦", desc: "ATM nội địa / QR Code" },
  { id: "zalopay", label: "ZaloPay", icon: "💙", desc: "Ví ZaloPay hoặc QR" },
  { id: "bank", label: "Chuyển khoản ngân hàng", icon: "🔁", desc: "STK: 1234 5678 9012 — Vietcombank" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  const [currentStep, setCurrentStep] = useState(1); // 1 = Shipping info, 2 = Payment
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    province: "", district: "", ward: "", address: "", note: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPlacing, setIsPlacing] = useState(false);

  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethod)!;
  const shippingFee = subtotal >= 500000 && shippingMethod === "standard" ? 0 : selectedShipping.price;
  const total = subtotal + shippingFee;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "province") setForm((prev) => ({ ...prev, province: e.target.value, district: "", ward: "" }));
  };

  const isStep1Valid = form.fullName && form.phone && form.province && form.district && form.address;

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    const orderId = `PAP-${Date.now()}`;
    navigate(`/order-success/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <p className="text-2xl font-bold mb-4">Giỏ hàng trống!</p>
          <Link to="/shop" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all">
            Tiếp tục mua sắm
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const districts = districtsByProvince[form.province] ?? districtsByProvince["default"];

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {steps.map((step, idx) => {
            const stepNum = idx;
            const active = stepNum === currentStep;
            const done = stepNum < currentStep;
            return (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all
                  ${done ? "text-primary" : active ? "bg-primary text-primary-foreground shadow-md" : "text-foreground/40"}`}>
                  {done ? <CheckCircle size={18} weight="fill" /> : <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 ${active ? "border-white text-white" : "border-foreground/30"}`}>{idx + 1}</span>}
                  <span className="hidden sm:inline">{step}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-8 md:w-16 mx-1 rounded ${stepNum < currentStep ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <div className="flex-1 space-y-6">

            {/* Step 1: Shipping Info */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><MapPin size={22} className="text-primary" />Thông tin giao hàng</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Họ và tên người nhận *</label>
                    <input name="fullName" value={form.fullName} onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                      placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Số điện thoại *</label>
                    <input name="phone" value={form.phone} onChange={handleFormChange} type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                      placeholder="0901 234 567" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Email</label>
                    <input name="email" value={form.email} onChange={handleFormChange} type="email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                      placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Tỉnh / Thành phố *</label>
                    <select name="province" value={form.province} onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all bg-white">
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Quận / Huyện *</label>
                    <select name="district" value={form.district} onChange={handleFormChange} disabled={!form.province}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all bg-white disabled:opacity-50">
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Số nhà, tên đường *</label>
                    <input name="address" value={form.address} onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                      placeholder="123 Nguyễn Huệ" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Ghi chú đơn hàng</label>
                    <textarea name="note" value={form.note} onChange={handleFormChange} rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all resize-none"
                      placeholder="VD: Giao buổi sáng, gọi trước 30 phút..." />
                  </div>
                </div>

                {/* Lưu ý đặc biệt */}
                <div className="bg-secondary/30 rounded-xl p-4 flex gap-3 text-sm text-foreground/70">
                  <Package size={20} className="text-primary shrink-0 mt-0.5" />
                  <p>Tất cả cây cảnh PAP được đóng gói chuyên dụng với lớp xốp, giấy báo sinh thái để bảo vệ rễ và thân cây trong quá trình vận chuyển.</p>
                </div>

                {/* Shipping Method */}
                <div>
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Truck size={20} className="text-primary" />Phương thức vận chuyển</h3>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => {
                      const freeForStandard = method.id === "standard" && subtotal >= 500000;
                      return (
                        <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMethod === method.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30"}`}>
                          <input type="radio" name="shipping" value={method.id} checked={shippingMethod === method.id} onChange={() => setShippingMethod(method.id)} className="accent-primary" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{method.label}</p>
                            <p className="text-xs text-foreground/60 mt-0.5">{method.time} · {method.note}</p>
                          </div>
                          <span className={`font-bold text-sm ${freeForStandard ? "text-green-600" : "text-primary"}`}>
                            {freeForStandard ? "MIỄN PHÍ" : method.price === 0 ? "MIỄN PHÍ" : `+${method.price.toLocaleString("vi-VN")}đ`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Valid}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  Tiếp tục đến Thanh toán
                  <CaretRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentStep(1)} className="text-foreground/50 hover:text-primary transition-colors">
                    <CaretLeft size={22} weight="bold" />
                  </button>
                  <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard size={22} className="text-primary" />Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30"}`}>
                      <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-primary" />
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{method.label}</p>
                        <p className="text-xs text-foreground/60 mt-0.5">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && <CheckCircle size={20} className="text-primary" weight="fill" />}
                    </label>
                  ))}
                </div>

                {/* QR Demo for MoMo / VNPay / ZaloPay */}
                {(paymentMethod === "momo" || paymentMethod === "vnpay" || paymentMethod === "zalopay") && (
                  <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-3 border border-gray-200">
                    <div className="w-40 h-40 bg-white border-4 border-primary rounded-xl flex items-center justify-center">
                      <div className="grid grid-cols-5 gap-0.5">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div key={i} className={`w-3 h-3 rounded-sm ${Math.random() > 0.5 ? "bg-primary" : "bg-transparent"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground/70">Quét mã QR bằng app {paymentMethod === "momo" ? "MoMo" : paymentMethod === "vnpay" ? "VNPay" : "ZaloPay"}</p>
                    <div className="flex items-center gap-2 text-orange-600 text-sm font-bold bg-orange-50 px-4 py-2 rounded-full">
                      <Clock size={16} weight="fill" />
                      Mã hết hạn sau <span id="countdown">14:59</span>
                    </div>
                  </div>
                )}

                {/* Bank transfer */}
                {paymentMethod === "bank" && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-2 text-sm">
                    <p className="font-bold text-foreground">Thông tin chuyển khoản:</p>
                    <p><span className="text-foreground/60">Ngân hàng:</span> <span className="font-semibold">Vietcombank</span></p>
                    <p><span className="text-foreground/60">Số tài khoản:</span> <span className="font-semibold font-mono">1234 5678 9012</span></p>
                    <p><span className="text-foreground/60">Chủ tài khoản:</span> <span className="font-semibold">PLAN A PLANT</span></p>
                    <p><span className="text-foreground/60">Nội dung:</span> <span className="font-semibold text-primary">PAP {form.phone}</span></p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-foreground/60 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                  <ShieldCheck size={20} className="text-green-600 shrink-0" />
                  Thông tin thanh toán được mã hóa SSL 256-bit. PAP cam kết bảo mật tuyệt đối.
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isPlacing ? (
                    <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />Đang xử lý...</>
                  ) : (
                    <>Đặt hàng ngay · {total.toLocaleString("vi-VN")}đ</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 sticky top-28">
              <h2 className="text-lg font-bold mb-5 pb-4 border-b border-secondary">Tóm tắt đơn hàng ({items.length} sản phẩm)</h2>
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative shrink-0">
                      <img src={item.image} alt={item.title} className="w-14 h-14 rounded-lg object-cover" />
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                      <p className="text-xs text-foreground/50">{item.planter}</p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-secondary pt-4 mb-4">
                <div className="flex justify-between text-foreground/70"><span>Tạm tính</span><span>{subtotal.toLocaleString("vi-VN")}đ</span></div>
                <div className="flex justify-between text-foreground/70">
                  <span>Phí vận chuyển</span>
                  <span className={shippingFee === 0 ? "text-green-600 font-semibold" : ""}>{shippingFee === 0 ? "MIỄN PHÍ" : `${shippingFee.toLocaleString("vi-VN")}đ`}</span>
                </div>
              </div>
              <div className="flex justify-between font-black text-lg border-t border-secondary pt-4">
                <span>Tổng cộng</span>
                <span className="text-primary">{total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
