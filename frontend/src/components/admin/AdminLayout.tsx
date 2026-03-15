import { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router";
import {
  Leaf, Gauge, Package, ShoppingBag, Users, Newspaper,
  SignOut, List, X, Bell, MagnifyingGlass, CaretRight,
  FolderOpen, Star, Flower, Wrench
} from "@phosphor-icons/react";
import { useAdminStore } from "../../stores/adminStore";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: Gauge, exact: true, accent: "text-cyan-300" },
  { to: "/admin/products", label: "Sản phẩm", icon: Package, exact: false, accent: "text-emerald-300" },
  { to: "/admin/categories", label: "Danh mục", icon: FolderOpen, exact: false, accent: "text-violet-300" },
  { to: "/admin/planters", label: "Chậu cây", icon: Flower, exact: false, accent: "text-sky-300" },
  { to: "/admin/accessories", label: "Phụ kiện", icon: Wrench, exact: false, accent: "text-amber-300" },
  { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag, exact: false, accent: "text-rose-300" },
  { to: "/admin/customers", label: "Khách hàng", icon: Users, exact: false, accent: "text-indigo-300" },
  { to: "/admin/reviews", label: "Đánh giá", icon: Star, exact: false, accent: "text-yellow-300" },
  { to: "/admin/blog", label: "Blog", icon: Newspaper, exact: false, accent: "text-lime-300" },
];

// ── Extracted outside render to avoid "create components during render" lint ──
interface SidebarProps {
  user: { name: string; role: string; email?: string; avatar?: string } | null;
  onClose: () => void;
  onLogout: () => void;
}

function SidebarContent({ user, onClose, onLogout }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-9 h-9 bg-[#F7E7CE]/10 rounded-xl flex items-center justify-center">
          <Leaf size={20} weight="fill" className="text-[#F7E7CE]" />
        </div>
        <div>
          <p className="text-[#F7E7CE] font-black text-sm tracking-wider leading-none">PLANS THANH TÙNG</p>
          <p className="text-white/30 text-[10px] font-medium tracking-widest uppercase mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, exact, accent }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${isActive
                ? "bg-[#F7E7CE]/10 text-[#F7E7CE] shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} weight={isActive ? "fill" : "regular"} className={isActive ? accent : ""} />
                <span className="flex-1 text-sm">{label}</span>
                {isActive && <CaretRight size={12} weight="bold" className="text-[#F7E7CE]/50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-3">
          <img src={user?.avatar || `https://i.pravatar.cc/64?u=${user?.email || user?.name || "admin"}`} alt={user?.name} className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-bold truncate">{user?.name}</p>
            <p className="text-white/40 text-[10px] truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
        >
          <SignOut size={18} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { isAuthenticated, user, logout } = useAdminStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-[#0F1923] border-r border-white/5 shadow-2xl">
        <SidebarContent user={user} onClose={() => {}} onLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0F1923] shadow-2xl transition-transform duration-300 lg:hidden flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <SidebarContent user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors">
            <List size={24} />
          </button>

          {/* Search */}
          <div className="relative hidden md:flex flex-1 max-w-xs">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Tìm kiếm nhanh..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 focus:border-[#102C26]/40 transition-all"
            />
          </div>

          <div className="flex-1 lg:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <a
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#102C26] bg-[#102C26]/10 px-3 py-2 rounded-xl hover:bg-[#102C26]/20 transition-colors"
            >
              <Leaf size={14} weight="fill" />
              Xem Store
            </a>
            <img src={user?.avatar || `https://i.pravatar.cc/64?u=${user?.email || user?.name || "admin"}`} alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-[#102C26]/20 cursor-pointer" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



