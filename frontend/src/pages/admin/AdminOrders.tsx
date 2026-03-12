import { useState } from "react";
import { Link } from "react-router";
import { MagnifyingGlass, Eye, FunnelSimple } from "@phosphor-icons/react";
import { mockOrders } from "../../data/mockData";
import type { Order } from "../../types";

const statusCfg: Record<Order["status"], { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700" },
  packing:   { label: "Đóng gói",     color: "bg-indigo-100 text-indigo-700" },
  shipping:  { label: "Đang giao",    color: "bg-orange-100 text-orange-700" },
  delivered: { label: "Đã giao",      color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy",       color: "bg-red-100 text-red-700" },
  returning: { label: "Đổi/Trả",      color: "bg-purple-100 text-purple-700" },
};

const filterTabs = [
  { val: "all", label: "Tất cả" },
  { val: "shipping", label: "Đang giao" },
  { val: "delivered", label: "Đã giao" },
  { val: "pending", label: "Chờ xác nhận" },
  { val: "cancelled", label: "Đã hủy" },
];

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockOrders.filter((o) => {
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
          <h1 className="text-2xl font-black text-gray-900">Đơn hàng</h1>
          <p className="text-gray-500 text-sm">{filtered.length} đơn hàng</p>
        </div>
      </div>

      {/* Search + Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn hoặc địa chỉ..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FunnelSimple size={16} className="text-gray-400 shrink-0 mt-2" />
          {filterTabs.map(({ val, label }) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === val ? "bg-[#102C26] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Địa chỉ giao</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Thanh toán</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-medium">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              ) : filtered.map((order) => {
                const cfg = statusCfg[order.status];
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#102C26] text-xs tracking-wider">{order.id}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{order.date}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-gray-700 text-xs max-w-[200px] truncate">{order.shippingAddress}</p>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-gray-600 text-xs">{order.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-gray-900">{order.total.toLocaleString("vi-VN")}đ</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#102C26] hover:underline px-2.5 py-1.5 rounded-lg hover:bg-[#102C26]/5 transition-colors">
                        <Eye size={14} /> Xem
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
