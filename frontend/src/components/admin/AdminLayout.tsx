import { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router";
import {
  Leaf, Gauge, Package, ShoppingBag, Users, Newspaper,
  SignOut, List, X, Bell, MagnifyingGlass, CaretRight,
  FolderOpen, Star, Flower, Wrench
} from "@phosphor-icons/react";
import { useAdminStore } from "../../stores/adminStore";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: Gauge, exact: true, accent: "text-cyan-700" },
  { to: "/admin/products", label: "Sản phẩm", icon: Package, exact: false, accent: "text-emerald-700" },
  { to: "/admin/categories", label: "Danh mục", icon: FolderOpen, exact: false, accent: "text-teal-700" },
  { to: "/admin/planters", label: "Chậu cây", icon: Flower, exact: false, accent: "text-sky-700" },
  { to: "/admin/accessories", label: "Phụ kiện", icon: Wrench, exact: false, accent: "text-amber-700" },
  { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag, exact: false, accent: "text-rose-700" },
  { to: "/admin/customers", label: "Khách hàng", icon: Users, exact: false, accent: "text-indigo-700" },
  { to: "/admin/reviews", label: "Đánh giá", icon: Star, exact: false, accent: "text-yellow-700" },
  { to: "/admin/blog", label: "Blog", icon: Newspaper, exact: false, accent: "text-lime-700" },
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
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#6f9d5d] shadow-[0_18px_35px_-24px_rgba(79,127,79,0.95)]">
          <Leaf size={20} weight="fill" className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-sidebar-foreground font-black text-sm tracking-wider leading-none">PLANS THANH TÙNG</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/45">Admin Panel</p>
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
                ? "bg-primary text-primary-foreground shadow-[0_16px_30px_-20px_rgba(79,127,79,0.95)]"
                : "text-sidebar-foreground/68 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} weight={isActive ? "fill" : "regular"} className={isActive ? accent : ""} />
                <span className="flex-1 text-sm">{label}</span>
                {isActive && <CaretRight size={12} weight="bold" className="text-primary-foreground/70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-sidebar-accent px-3 py-3">
          <img src={user?.avatar || `https://i.pravatar.cc/64?u=${user?.email || user?.name || "admin"}`} alt={user?.name} className="h-8 w-8 shrink-0 rounded-full border border-primary/15 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-sidebar-foreground">{user?.name}</p>
            <p className="truncate text-[10px] text-sidebar-foreground/45">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10"
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
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar shadow-[0_30px_60px_-42px_rgba(36,53,42,0.95)] lg:flex">
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
      <aside className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-sidebar shadow-2xl transition-transform duration-300 lg:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground">
          <X size={22} />
        </button>
        <SidebarContent user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/80 bg-background/85 px-4 shadow-sm backdrop-blur-md md:px-6">
          <button onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground transition-colors hover:text-foreground lg:hidden">
            <List size={24} />
          </button>

          {/* Search */}
          <div className="relative hidden md:flex flex-1 max-w-xs">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Tìm kiếm nhanh..."
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex-1 lg:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <a
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 sm:flex"
            >
              <Leaf size={14} weight="fill" />
              Xem Store
            </a>
            <img src={user?.avatar || `https://i.pravatar.cc/64?u=${user?.email || user?.name || "admin"}`} alt={user?.name}
              className="h-8 w-8 cursor-pointer rounded-full border-2 border-primary/20 object-cover" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,253,247,0.55),rgba(245,242,232,0.95))]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



