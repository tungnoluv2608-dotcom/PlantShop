import { ArrowUp, Package, ShoppingBag, Users, CurrencyCircleDollar, TrendUp, Eye, Clock, CheckCircle } from "@phosphor-icons/react";
import { Link } from "react-router";
import { products, mockOrders } from "../../data/mockData";

const stats = [
  {
    label: "Doanh thu tháng này",
    value: "48.250.000đ",
    change: "+12.5%",
    up: true,
    icon: CurrencyCircleDollar,
    color: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-600",
  },
  {
    label: "Đơn hàng hôm nay",
    value: "24",
    change: "+3 so với hôm qua",
    up: true,
    icon: ShoppingBag,
    color: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    label: "Tổng sản phẩm",
    value: String(products.length),
    change: "2 sắp hết hàng",
    up: false,
    icon: Package,
    color: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    label: "Khách hàng",
    value: "1.240",
    change: "+58 tháng này",
    up: true,
    icon: Users,
    color: "bg-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
];

const recentOrders = mockOrders.slice(0, 5);

const statusCfg: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700" },
  packing:   { label: "Đóng gói",     color: "bg-indigo-100 text-indigo-700" },
  shipping:  { label: "Đang giao",    color: "bg-orange-100 text-orange-700" },
  delivered: { label: "Đã giao",      color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy",       color: "bg-red-100 text-red-700" },
  returning: { label: "Đổi/Trả",      color: "bg-purple-100 text-purple-700" },
};

const topProducts = products.slice(0, 5).map((p, i) => ({
  ...p,
  sold: [48, 35, 29, 22, 18][i],
  revenue: p.price * [48, 35, 29, 22, 18][i],
}));

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Tổng quan hoạt động của PAP hôm nay, {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, up, icon: Icon, color, bg, text }) => (
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
            <Link to="/admin/orders" className="text-xs font-semibold text-[#102C26] hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const cfg = statusCfg[order.status];
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-[#102C26]">{order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.date} · {order.items.length} sản phẩm</p>
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
              <CheckCircle size={18} className="text-[#102C26]" /> Bán chạy nhất
            </h2>
            <Link to="/admin/products" className="text-xs font-semibold text-[#102C26] hover:underline">
              Tất cả →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-amber-500" : "text-gray-400"}`}>
                  {i + 1}
                </span>
                <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{p.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.sold} đã bán</p>
                </div>
                <p className="text-xs font-bold text-[#102C26] shrink-0">{(p.revenue / 1_000_000).toFixed(1)}M</p>
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
    </div>
  );
}
