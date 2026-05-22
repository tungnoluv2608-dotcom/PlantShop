import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MagnifyingGlass, Eye, FunnelSimple } from "@phosphor-icons/react";
import { adminApi } from "../../services/apiService";
import type { Order } from "../../types";

const statusCfg: Record<Order["status"], { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/25" },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-500/10 text-blue-400 border border-blue-500/25" },
  packing:   { label: "Đóng gói",     color: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25" },
  shipping:  { label: "Đang giao",    color: "bg-orange-500/10 text-orange-400 border border-orange-500/25" },
  delivered: { label: "Đã giao",      color: "bg-green-500/10 text-green-400 border border-green-500/25" },
  cancelled: { label: "Đã hủy",       color: "bg-red-500/10 text-red-400 border border-red-500/25" },
  returning: { label: "Đổi/Trả",      color: "bg-purple-500/10 text-purple-400 border border-purple-500/25" },
};

const filterTabs = [
  { val: "all", label: "Tất cả" },
  { val: "shipping", label: "Đang giao" },
  { val: "delivered", label: "Đã giao" },
  { val: "pending", label: "Chờ xác nhận" },
  { val: "cancelled", label: "Đã hủy" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    adminApi.listOrders()
      .then((data) => setOrders(data as Order[]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = !search.trim() ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Đơn hàng</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} đơn hàng</p>
        </div>
      </div>

      {/* Search + Filter Tabs */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-4 space-y-3">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn hoặc địa chỉ..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background text-foreground placeholder-muted-foreground/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FunnelSimple size={16} className="text-muted-foreground/60 shrink-0 mt-2" />
          {filterTabs.map(({ val, label }) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === val ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Mã đơn</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Địa chỉ giao</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Thanh toán</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tổng tiền</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                ) : filtered.map((order) => {
                  const cfg = statusCfg[order.status] ?? statusCfg["pending"];
                  return (
                    <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-primary text-xs tracking-wider">{order.id}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{order.date}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <p className="text-muted-foreground text-xs max-w-[200px] truncate">{order.shippingAddress}</p>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-muted-foreground text-xs">{order.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-foreground">{order.total.toLocaleString("vi-VN")}đ</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                          <Eye size={14} /> Xem
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
