import { useState, useRef, useEffect } from "react";
import { MagnifyingGlass, CaretDown, ShoppingCart, UserCircle, Plant, List, X, SignOut } from "@phosphor-icons/react";
import { Link, useNavigate, useLocation } from "react-router";
import { useCartStore } from "../../stores/cartStore";
import { useAuthStore } from "../../stores/authStore";
import { useWishlistStore } from "../../stores/wishlistStore";
import { productService } from "../../services/productService";
import { authService } from "../../services/authService";
import { planterApi } from "../../services/apiService";
import { toast } from "sonner";
import type { Planter } from "../../types";

interface SearchResult {
  id: string;
  title: string;
  category: string;
}

const navLinks = [
  { label: "Trang chủ", path: "/" },
  { label: "Cửa hàng", path: "/shop" },
  { label: "Bán sỉ", path: "/wholesale" },
  { label: "Góc Xanh", path: "/blog" },
];

const baseNavDropdowns = [
  {
    label: "Cây cảnh",
    items: [
      { name: "Cây trong nhà", category: "Cây trong nhà" },
      { name: "Cây leo", category: "Cây leo" },
      { name: "Bonsai", category: "Bonsai" },
    ],
  },
  {
    label: "Chậu cây",
    items: [
      { name: "Chậu gốm", category: "Chậu gốm" },
      { name: "Chậu xi măng", category: "Chậu xi măng" },
    ],
  },
];

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const authToken = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated && Boolean(s.token));
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const syncWishlist = useWishlistStore((s) => s.syncWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [accessoryGroups, setAccessoryGroups] = useState<string[]>([]);

  useEffect(() => {
    planterApi
      .list("accessory")
      .then((items: Planter[]) => {
        const groups = Array.from(new Set(items.map((item) => item.material).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi"));
        setAccessoryGroups(groups);
      })
      .catch(() => setAccessoryGroups([]));
  }, []);

  const navDropdowns = [
    ...baseNavDropdowns,
    {
      label: "Phụ kiện",
      items: accessoryGroups.length
        ? accessoryGroups.map((group) => ({ name: group, category: group }))
        : [{ name: "Tất cả phụ kiện", category: "*" }],
    },
  ];

  // Close search and user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      clearWishlist();
      clearAuth();
      toast.success("Đã đăng xuất");
      navigate("/");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    setIsMobileMenuOpen(false);
    // eslint-disable-next-line react-compiler/react-compiler
    setOpenDropdown(null);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      // eslint-disable-next-line react-compiler/react-compiler
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await productService.searchProducts(searchQuery);
      setSearchResults(results);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!authToken) {
      clearWishlist();
      return;
    }
    syncWishlist().catch(() => undefined);
  }, [authToken, syncWishlist, clearWishlist]);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate("/shop");
      setSearchQuery("");
    }
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleDropdownEnter = (label: string) => {
    clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border/80 bg-background/88 px-6 py-4 shadow-[0_14px_30px_-28px_rgba(36,53,42,0.9)] backdrop-blur-xl md:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary to-[#6f9d5d] shadow-[0_16px_35px_-22px_rgba(79,127,79,1)]">
            <Plant size={22} weight="fill" className="text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-2xl tracking-tight text-primary">
              PlanS Thanh Tùng
            </div>
            <p className="hidden text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/45 md:block">
              Plant Care System
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-3 rounded-full border border-border/70 bg-card/92 px-3 py-2 text-sm font-medium text-foreground/75 shadow-[0_12px_30px_-24px_rgba(36,53,42,0.75)] md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-full px-4 py-2 transition-all ${
                isActive(link.path)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-secondary/70 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Dropdown nav items */}
          {navDropdowns.map((dropdown) => (
            <div
              key={dropdown.label}
              className="relative"
              onMouseEnter={() => handleDropdownEnter(dropdown.label)}
              onMouseLeave={handleDropdownLeave}
            >
              <button className="flex items-center gap-1 rounded-full px-4 py-2 transition-all hover:bg-secondary/70 hover:text-primary">
                {dropdown.label}
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`transition-transform duration-200 ${openDropdown === dropdown.label ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Panel */}
              {openDropdown === dropdown.label && (
                <div className="absolute left-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-border/80 bg-card/96 shadow-[0_30px_60px_-35px_rgba(36,53,42,0.75)] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur">
                  {dropdown.items.map((item) => (
                    <Link
                      key={item.name}
                      to={
                        dropdown.label === "Cây cảnh"
                          ? `/shop?category=${encodeURIComponent(item.category)}`
                          : dropdown.label === "Chậu cây"
                            ? `/planters?material=${encodeURIComponent(item.category)}`
                          : item.category === "*"
                              ? "/accessories"
                              : `/accessories?group=${encodeURIComponent(item.category)}`
                      }
                      className="block border-b border-border/50 px-4 py-3 text-sm text-foreground/75 transition-colors last:border-0 hover:bg-secondary/55 hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search Bar & Icons - Desktop */}
        <div className="hidden items-center gap-4 sm:flex">
          <div className="relative w-40 lg:w-64" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass size={18} className="text-foreground/35" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchSubmit}
              className="w-full rounded-full border border-border/80 bg-card/92 py-2.5 pl-10 pr-4 text-sm shadow-[0_10px_25px_-22px_rgba(36,53,42,0.9)] transition-all focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />

            {/* Search Suggestions Dropdown */}
            {isSearchFocused && searchQuery.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-3 flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/96 shadow-[0_30px_60px_-35px_rgba(36,53,42,0.75)] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur">
                {searchResults.length > 0 ? (
                  <>
                    <div className="bg-secondary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground/45">
                      Gợi ý sản phẩm
                    </div>
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        onClick={() => { setIsSearchFocused(false); setSearchQuery(""); }}
                        className="flex cursor-pointer items-center gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0 hover:bg-secondary/40"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                          <Plant size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">{item.title}</span>
                          <span className="text-xs text-foreground/50">{item.category}</span>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setIsSearchFocused(false);
                        navigate("/shop");
                        setSearchQuery("");
                      }}
                      className="w-full bg-secondary/35 px-4 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-secondary/60"
                    >
                      Xem tất cả kết quả cho "{searchQuery}" &rarr;
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Không tìm thấy sản phẩm nào phù hợp.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 border-l border-border/80 pl-4 text-foreground">
            <Link to="/cart" className="hover:text-primary transition-colors relative block">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  {getInitials(user?.name || "U")}
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-border/80 bg-card/96 shadow-[0_30px_60px_-35px_rgba(36,53,42,0.75)] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur">
                    <div className="border-b border-border/60 bg-secondary/35 px-4 py-3">
                      <p className="truncate text-xs font-medium uppercase tracking-wider text-foreground/45">Tài khoản</p>
                      <p className="truncate text-sm font-bold text-foreground">{user?.name}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/75 transition-colors hover:bg-secondary/45 hover:text-primary"
                    >
                      <UserCircle size={18} />
                      Trang cá nhân
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 border-t border-border/60 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50/80"
                    >
                      <SignOut size={18} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signin" className="hover:text-primary transition-colors block">
                <UserCircle size={24} />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile: Cart + Hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <Link to="/cart" className="hover:text-primary transition-colors relative text-foreground">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground p-1"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={28} weight="bold" /> : <List size={28} weight="bold" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute left-0 right-0 top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto border-b border-border/80 bg-card/96 shadow-[0_30px_60px_-35px_rgba(36,53,42,0.85)] animate-in slide-in-from-top-2 duration-300 backdrop-blur">
            {/* Search */}
            <div className="border-b border-border/70 p-4">
              <div className="relative">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate("/shop");
                      setSearchQuery("");
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className="w-full rounded-xl border border-border/80 bg-background py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            {/* Nav Links */}
            <div className="py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-6 py-3 font-medium transition-colors ${
                    isActive(link.path)
                      ? "border-l-4 border-primary bg-primary/8 text-primary"
                      : "text-foreground/75 hover:bg-secondary/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Dropdown sections */}
              {navDropdowns.map((dropdown) => (
                <div key={dropdown.label}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === dropdown.label ? null : dropdown.label)}
                    className="flex w-full items-center justify-between px-6 py-3 font-medium text-foreground/75 transition-colors hover:bg-secondary/40"
                  >
                    {dropdown.label}
                    <CaretDown
                      size={16}
                      weight="bold"
                      className={`transition-transform duration-200 ${openDropdown === dropdown.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openDropdown === dropdown.label && (
                    <div className="bg-secondary/25">
                      {dropdown.items.map((item) => (
                        <Link
                          key={item.name}
                          to={
                            dropdown.label === "Cây cảnh"
                              ? `/shop?category=${encodeURIComponent(item.category)}`
                              : dropdown.label === "Chậu cây"
                                ? `/planters?material=${encodeURIComponent(item.category)}`
                                : item.category === "*"
                                  ? "/accessories"
                                  : `/accessories?group=${encodeURIComponent(item.category)}`
                          }
                          className="block py-2.5 pl-10 pr-6 text-sm text-foreground/65 transition-colors hover:text-primary"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Links */}
            <div className="border-t border-border/70 p-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                      {getInitials(user?.name || "U")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block w-full rounded-xl border border-primary/35 py-3 text-center font-semibold text-primary transition-colors hover:bg-primary/8"
                  >
                    Trang cá nhân
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl bg-red-50 py-3 text-center font-semibold text-red-500 transition-colors hover:bg-red-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/signin"
                    className="flex-1 rounded-xl border border-primary/35 py-3 text-center font-semibold text-primary transition-colors hover:bg-primary/8"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 text-center py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



