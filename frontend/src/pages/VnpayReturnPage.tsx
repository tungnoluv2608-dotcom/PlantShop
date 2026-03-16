import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { CheckCircle, Clock } from "@phosphor-icons/react";
import { toast } from "sonner";
import { orderApi } from "../services/apiService";
import { useCartStore } from "../stores/cartStore";

export default function VnpayReturnPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const query = new URLSearchParams(location.search);

    orderApi
      .verifyVnpayReturn(query)
      .then((res) => {
        if (res.success && res.orderId) {
          clearCart();
          toast.success("Thanh toán VNPay thành công");
          navigate(`/order-success/${res.orderId}?method=vnpay`, { replace: true });
          return;
        }

        const failedOrderId = res.orderId ? `?orderId=${encodeURIComponent(res.orderId)}` : "";
        toast.error(res.message || "Thanh toán VNPay thất bại");
        navigate(`/payment-failed${failedOrderId}`, { replace: true });
      })
      .catch(() => {
        toast.error("Không thể xác minh giao dịch VNPay");
        navigate("/payment-failed", { replace: true });
      });
  }, [location.search, navigate, clearCart]);

  return (
    <div className="min-h-screen bg-[#F0F5F1] flex items-center justify-center px-4">
      <div className="bg-white border border-secondary rounded-3xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <Clock size={30} className="text-blue-600" weight="fill" />
        </div>
        <h1 className="text-xl font-black text-foreground">Đang xác nhận giao dịch VNPay</h1>
        <p className="text-sm text-foreground/60 mt-2">Hệ thống đang kiểm tra trạng thái thanh toán, vui lòng chờ trong giây lát.</p>
        <div className="mt-5 inline-flex items-center gap-2 text-primary font-semibold text-sm">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Đang xử lý...
        </div>
        <div className="mt-6 text-xs text-foreground/40 inline-flex items-center gap-1">
          <CheckCircle size={14} />
          Không đóng trang trong khi đang xác minh thanh toán.
        </div>
      </div>
    </div>
  );
}
