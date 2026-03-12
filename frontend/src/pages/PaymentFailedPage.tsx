import { Link, useNavigate } from "react-router";
import { WarningCircle, ArrowCounterClockwise, Headset, ArrowLeft } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-secondary p-8 md:p-10 text-center">

          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow">
            <WarningCircle size={48} className="text-red-500" weight="fill" />
          </div>

          <h1 className="text-2xl font-black text-foreground mb-2">Thanh toán không thành công</h1>
          <p className="text-foreground/60 mb-6">
            Đơn hàng của bạn vẫn được giữ trong <span className="font-bold text-orange-500">30 phút</span>. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>

          {/* Reasons */}
          <div className="bg-red-50 rounded-xl p-4 text-left text-sm space-y-2 mb-8 border border-red-100">
            <p className="font-bold text-red-700 mb-3">Nguyên nhân có thể:</p>
            {["Số dư tài khoản không đủ", "Thông tin thẻ không hợp lệ", "Giao dịch bị ngân hàng từ chối", "Hết thời gian chờ thanh toán"].map((reason) => (
              <p key={reason} className="flex items-center gap-2 text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {reason}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/checkout")}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md"
            >
              <ArrowCounterClockwise size={20} weight="bold" />
              Thử lại thanh toán
            </button>
            <Link to="/contact"
              className="flex items-center justify-center gap-2 bg-white text-foreground py-3.5 rounded-xl font-semibold border border-gray-200 hover:border-primary/30 transition-all">
              <Headset size={20} />
              Liên hệ hỗ trợ
            </Link>
            <Link to="/shop"
              className="flex items-center justify-center gap-2 text-foreground/50 hover:text-primary text-sm transition-colors">
              <ArrowLeft size={16} />
              Quay lại mua sắm
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
