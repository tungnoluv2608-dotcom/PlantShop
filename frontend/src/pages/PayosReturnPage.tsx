import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { CheckCircle, Clock } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useCartStore } from "../stores/cartStore";
import { orderApi } from "../services/apiService";

export default function PayosReturnPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const orderCode = params.get("orderCode");
    const isCancelled = params.get("cancel") === "true";

    let isMounted = true;

    if (isCancelled || status === "CANCELLED") {
      const failedOrderId = orderCode ? `?orderId=${encodeURIComponent(orderCode)}` : "";
      toast.error("Thanh toán PayOS thất bại hoặc bị hủy");
      navigate(`/payment-failed${failedOrderId}`, { replace: true });
      return () => {
        isMounted = false;
      };
    }

    orderApi
      .verifyPayosReturn(params)
      .then((result) => {
        if (!isMounted) return;

        if (result.success && result.orderId) {
          clearCart();
          toast.success("Thanh toán PayOS thành công");
          navigate(`/order-success/${result.orderId}?method=payos`, { replace: true });
          return;
        }

        const failedOrderId = result.orderId || orderCode;
        toast.error(result.message || "Thanh toán PayOS thất bại hoặc chưa hoàn tất");
        navigate(
          `/payment-failed${failedOrderId ? `?orderId=${encodeURIComponent(failedOrderId)}` : ""}`,
          { replace: true }
        );
      })
      .catch((error: unknown) => {
        if (!isMounted) return;

        const message = error instanceof Error ? error.message : "Không thể xác minh thanh toán PayOS.";
        toast.error(message);
        navigate(`/payment-failed${orderCode ? `?orderId=${encodeURIComponent(orderCode)}` : ""}`, {
          replace: true,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [location.search, navigate, clearCart]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="bg-card border border-secondary rounded-3xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-violet-50 flex items-center justify-center mb-4">
          <Clock size={30} className="text-violet-600" weight="fill" />
        </div>
        <h1 className="text-xl font-black text-foreground">Đang xác nhận giao dịch PayOS</h1>
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
