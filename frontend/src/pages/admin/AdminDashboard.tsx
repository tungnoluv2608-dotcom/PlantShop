import { useState, useEffect } from "react";
import { ArrowUp, Package, ShoppingBag, Users, CurrencyCircleDollar, TrendUp, Eye, Clock, CheckCircle } from "@phosphor-icons/react";
import { Link } from "react-router";
import { adminApi } from "../../services/apiService";
import type { Order, Product } from "../../types";

const statusCfg: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700" },
  packing:   { label: "Đóng gói",     color: "bg-indigo-100 text-indigo-700" },
  shipping:  { label: "Đang giao",    color: "bg-orange-100 text-orange-700" },
  delivered: { label: "Đã giao",      color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy",       color: "bg-red-100 text-red-700" },
  returning: { label: "Đổi/Trả",      color: "bg-purple-100 text-purple-700" },
};

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.listOrders(), adminApi.listProducts()])
      .then(([s, orders, prods]) => {
        setStats(s);
        setRecentOrders((orders as Order[]).slice(0, 5));
        setTopProducts((prods as Product[]).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    {
      label: "Doanh thu tháng này",
      value: `${(stats.totalRevenue / 1_000_000).toFixed(1)}M đ`,
      change: "Tổng doanh thu",
      up: true,
      icon: CurrencyCircleDollar,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Tổng đơn hàng",
      value: String(stats.totalOrders),
      change: "Tất cả đơn",
      up: true,
      icon: ShoppingBag,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Tổng sản phẩm",
      value: String(stats.totalProducts),
      change: "Đang bán",
      up: false,
      icon: Package,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Khách hàng",
      value: String(stats.totalCustomers),
      change: "Đã đăng ký",
      up: true,
      icon: Users,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Tổng quan hoạt động của PlanS Thanh Tùng hôm nay, {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="w-8 h-8 border-2 border-[#102C26] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map(({ label, value, change, up, icon: Icon, bg, text }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={20} className={text} weight="fill" />
                  </div>
                </div>
                <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
                <div className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-green-600" : "text-amber-600"}`}>
                  {up && <ArrowUp size={12} weight="bold" />}
                  {up && <TrendUp size={12} weight="bold" />}
                  <span>{change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={18} className="text-[#102C26]" /> Đơn hàng gần đây
                </h2>
                <Link to="/admin/orders" className="text-xs font-semibold text-[#102C26] hover:underline">Xem tất cả →</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">Chưa có đơn hàng nào</p>
                ) : recentOrders.map((order) => {
                  const cfg = statusCfg[order.status] ?? statusCfg["pending"];
                  return (
                    <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-[#102C26]">{order.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.date} · {order.items?.length ?? "?"} sản phẩm</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        <p className="font-bold text-sm text-gray-900 min-w-[80px] text-right">{order.total.toLocaleString("vi-VN")}đ</p>
                        <Link to={`/admin/orders/${order.id}`} className="text-gray-400 hover:text-[#102C26] transition-colors">
                          <Eye size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#102C26]" /> Sản phẩm
                </h2>
                <Link to="/admin/products" className="text-xs font-semibold text-[#102C26] hover:underline">Tất cả →</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-amber-500" : "text-gray-400"}`}>{i + 1}</span>
                    <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.price.toLocaleString("vi-VN")}đ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { to: "/admin/products/new", label: "Thêm sản phẩm", icon: Package, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { to: "/admin/orders", label: "Xem đơn hàng", icon: ShoppingBag, color: "text-orange-600 bg-orange-50 border-orange-100" },
              { to: "/admin/customers", label: "Khách hàng", icon: Users, color: "text-purple-600 bg-purple-50 border-purple-100" },
              { to: "/admin/blog", label: "Viết bài blog", icon: Users, color: "text-green-600 bg-green-50 border-green-100" },
            ].map(({ to, label, icon: Icon, color }) => (
              <Link key={to} to={to} className={`flex items-center gap-3 p-4 rounded-2xl border ${color} font-semibold text-sm hover:shadow-sm transition-all group`}>
                <Icon size={20} weight="fill" className="shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
