import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, CheckCircle, Package, Truck, XCircle, Clock } from "@phosphor-icons/react";
import { mockOrders } from "../../data/mockData";
import type { Order } from "../../types";
import { toast } from "sonner";

const statusCfg: Record<Order["status"], { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock size={14} weight="fill" /> },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700 border-blue-200",       icon: <CheckCircle size={14} weight="fill" /> },
  packing:   { label: "Đóng gói",     color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <Package size={14} weight="fill" /> },
  shipping:  { label: "Đang giao",    color: "bg-orange-100 text-orange-700 border-orange-200", icon: <Truck size={14} weight="fill" /> },
  delivered: { label: "Đã giao",      color: "bg-green-100 text-green-700 border-green-200",    icon: <CheckCircle size={14} weight="fill" /> },
  cancelled: { label: "Đã hủy",       color: "bg-red-100 text-red-700 border-red-200",          icon: <XCircle size={14} weight="fill" /> },
  returning: { label: "Đổi/Trả",      color: "bg-purple-100 text-purple-700 border-purple-200", icon: <ArrowLeft size={14} weight="bold" /> },
};

const STATUS_OPTIONS: Order["status"][] = ["pending", "confirmed", "packing", "shipping", "delivered", "cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = mockOrders.find((o) => o.id === id);
  const [status, setStatus] = useState<Order["status"]>(order?.status ?? "pending");

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Không tìm thấy đơn hàng.</p>
        <Link to="/admin/orders" className="text-[#102C26] font-semibold hover:underline text-sm mt-2 inline-block">← Quay lại</Link>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    toast.success(`Đã cập nhật trạng thái: ${statusCfg[status].label}`);
  };

  const cfg = statusCfg[status];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-black text-gray-900">{order.id}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Đặt ngày {order.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Items + Timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900">
              Sản phẩm đặt hàng
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.planter} · x{item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#102C26] shrink-0">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-bold text-gray-900 mb-5">Lịch sử đơn hàng</p>
            <div className="flex flex-col gap-3 relative">
              <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-100" />
              {order.timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${step.done ? "bg-[#102C26] border-[#102C26]" : "bg-white border-gray-200"}`}>
                    {step.done ? <CheckCircle size={12} weight="fill" className="text-white" /> : <span className="w-2 h-2 rounded-full bg-gray-300 block" />}
                  </div>
                  <div className="pb-3">
                    <p className={`text-sm font-semibold ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.status}</p>
                    {step.date && <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Info + Update Status */}
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{order.subtotal.toLocaleString("vi-VN")}đ</span></div>
              <div className="flex justify-between text-gray-600"><span>Phí ship</span><span>{order.shippingFee.toLocaleString("vi-VN")}đ</span></div>
              <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
                <span>Tổng cộng</span><span className="text-[#102C26]">{order.total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-bold text-gray-900 mb-4">Thông tin giao hàng</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div><span className="font-semibold text-gray-700">Địa chỉ:</span><p className="mt-0.5">{order.shippingAddress}</p></div>
              <div><span className="font-semibold text-gray-700">Thanh toán:</span> {order.paymentMethod}</div>
              {order.trackingNumber && <div><span className="font-semibold text-gray-700">Mã vận đơn:</span> <span className="font-mono text-[#102C26]">{order.trackingNumber}</span></div>}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-bold text-gray-900 mb-4">Cập nhật trạng thái</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Order["status"])}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 mb-3"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusCfg[s].label}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              className="w-full bg-[#102C26] text-[#F7E7CE] font-bold py-2.5 rounded-xl text-sm hover:bg-[#102C26]/90 transition-all shadow-sm"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
