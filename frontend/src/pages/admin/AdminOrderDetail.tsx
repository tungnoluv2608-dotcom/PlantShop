import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, CheckCircle, Package, Truck, XCircle, Clock } from "@phosphor-icons/react";
import { adminApi } from "../../services/apiService";
import type { Order } from "../../types";
import { toast } from "sonner";

const statusCfg: Record<Order["status"], { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/25", icon: <Clock size={14} weight="fill" /> },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-500/10 text-blue-400 border-blue-500/25",       icon: <CheckCircle size={14} weight="fill" /> },
  packing:   { label: "Đóng gói",     color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25", icon: <Package size={14} weight="fill" /> },
  shipping:  { label: "Đang giao",    color: "bg-orange-500/10 text-orange-400 border-orange-500/25", icon: <Truck size={14} weight="fill" /> },
  delivered: { label: "Đã giao",      color: "bg-green-500/10 text-green-400 border-green-500/25",    icon: <CheckCircle size={14} weight="fill" /> },
  cancelled: { label: "Đã hủy",       color: "bg-red-500/10 text-red-400 border-red-500/25",          icon: <XCircle size={14} weight="fill" /> },
  returning: { label: "Đổi/Trả",      color: "bg-purple-500/10 text-purple-400 border-purple-500/25", icon: <ArrowLeft size={14} weight="bold" /> },
};

const STATUS_OPTIONS: Order["status"][] = ["pending", "confirmed", "packing", "shipping", "delivered", "cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Order["status"]>("pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminApi.getOrderDetail(id)
      .then((data: Order) => {
        setOrder(data);
        setStatus(data.status);
      })
      .catch(() => toast.error("Không tìm thấy đơn hàng"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await adminApi.updateOrderStatus(id, status);
      setOrder((prev) => prev ? { ...prev, status } : prev);
      toast.success(`Đã cập nhật trạng thái: ${statusCfg[status].label}`);
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>
        <Link to="/admin/orders" className="text-primary font-semibold hover:underline text-sm mt-2 inline-block">← Quay lại</Link>
      </div>
    );
  }

  const cfg = statusCfg[status];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary/40 transition-colors text-muted-foreground">
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-black text-foreground">{order.id}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">Đặt ngày {order.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Items + Timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border font-bold text-foreground bg-secondary/10">Sản phẩm đặt hàng</div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/56x56?text=🌿"; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.planter} · x{item.quantity}</p>
                  </div>
                  <p className="font-bold text-primary shrink-0">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
              <p className="font-bold text-foreground mb-5">Lịch sử đơn hàng</p>
              <div className="flex flex-col gap-3 relative">
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
                {order.timeline.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${step.done ? "bg-primary border-primary" : "bg-card border-border"}`}>
                      {step.done ? <CheckCircle size={12} weight="fill" className="text-white" /> : <span className="w-2 h-2 rounded-full bg-muted-foreground/35 block" />}
                    </div>
                    <div className="pb-3">
                      <p className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground/50"}`}>{step.status}</p>
                      {step.date && <p className="text-xs text-muted-foreground/60 mt-0.5">{step.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Info + Update Status */}
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <p className="font-bold text-foreground mb-4">Tóm tắt đơn hàng</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Tạm tính</span><span>{order.subtotal.toLocaleString("vi-VN")}đ</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Phí ship</span><span>{order.shippingFee.toLocaleString("vi-VN")}đ</span></div>
              <div className="flex justify-between font-black text-foreground text-base border-t border-border pt-2 mt-2">
                <span>Tổng cộng</span><span className="text-primary">{order.total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <p className="font-bold text-foreground mb-4">Thông tin giao hàng</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div><span className="font-semibold text-foreground">Địa chỉ:</span><p className="mt-0.5">{order.shippingAddress}</p></div>
              <div><span className="font-semibold text-foreground">Thanh toán:</span> {order.paymentMethod}</div>
              {order.trackingNumber && <div><span className="font-semibold text-foreground">Mã vận đơn:</span> <span className="font-mono text-primary">{order.trackingNumber}</span></div>}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <p className="font-bold text-foreground mb-4">Cập nhật trạng thái</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Order["status"])}
              className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3 bg-card">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-card text-foreground">{statusCfg[s].label}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
