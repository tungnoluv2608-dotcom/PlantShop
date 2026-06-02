import { Link, useNavigate } from "react-router";
import { WarningCircle, ArrowCounterClockwise, ArrowLeft } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full bg-card rounded-3xl shadow-sm border border-secondary p-8 text-center">

          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <WarningCircle size={40} className="text-red-500" weight="fill" />
          </div>

          <h1 className="text-xl font-bold text-foreground mb-1.5">Thanh toán thất bại</h1>
          <p className="text-sm text-foreground/50 mb-6">
            Vui lòng thử lại hoặc chọn phương thức khác.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate("/checkout")}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              <ArrowCounterClockwise size={18} weight="bold" />
              Thử lại
            </button>
            <Link to="/shop"
              className="flex items-center justify-center gap-2 text-foreground/40 hover:text-primary text-sm transition-colors py-2">
              <ArrowLeft size={16} />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
