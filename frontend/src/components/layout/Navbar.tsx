import { useState, useRef, useEffect } from "react";
import { MagnifyingGlass, CaretDown, ShoppingCart, UserCircle, Plant, List, X } from "@phosphor-icons/react";
import { Link, useNavigate, useLocation } from "react-router";
import { useCartStore } from "../../stores/cartStore";
import { productService } from "../../services/productService";

interface SearchResult {
  id: string;
  title: string;
  category: string;
}

const navLinks = [
  { label: "Trang chủ", path: "/" },
  { label: "Cửa hàng", path: "/shop" },
];

const navDropdowns = [
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
  {
    label: "Phụ kiện",
    items: [
      { name: "Đất trồng", category: "Đất trồng" },
      { name: "Phân bón", category: "Phân bón" },
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
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await productService.searchProducts(searchQuery);
      setSearchResults(results);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="font-bold text-2xl tracking-tighter text-primary">
            PAP
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 font-medium text-gray-700">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors pb-1 ${
                isActive(link.path)
                  ? "text-primary font-semibold border-b-2 border-primary"
                  : "hover:text-primary/80"
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
              <button className="flex items-center gap-1 hover:text-primary/80 transition-colors pb-1">
                {dropdown.label}
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`transition-transform duration-200 ${openDropdown === dropdown.label ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Panel */}
              {openDropdown === dropdown.label && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {dropdown.items.map((item) => (
                    <Link
                      key={item.name}
                      to={`/shop?category=${encodeURIComponent(item.category)}`}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors border-b border-gray-50 last:border-0"
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
        <div className="hidden sm:flex items-center gap-4">
          <div className="relative w-40 lg:w-64" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchSubmit}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />

            {/* Search Suggestions Dropdown */}
            {isSearchFocused && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50/50 uppercase tracking-wider">
                      Gợi ý sản phẩm
                    </div>
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        onClick={() => { setIsSearchFocused(false); setSearchQuery(""); }}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-primary shrink-0">
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
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-primary hover:bg-gray-50 transition-colors bg-gray-50/30"
                    >
                      Xem tất cả kết quả cho "{searchQuery}" &rarr;
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy sản phẩm nào phù hợp.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 border-l border-gray-200 pl-4 text-foreground">
            <Link to="/cart" className="hover:text-primary transition-colors relative block">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <Link to="/signin" className="hover:text-primary transition-colors block">
              <UserCircle size={24} />
            </Link>
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
          <div className="absolute top-[65px] left-0 right-0 bg-white border-b border-gray-100 shadow-xl max-h-[calc(100vh-65px)] overflow-y-auto animate-in slide-in-from-top-2 duration-300">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                      ? "text-primary bg-primary/5 border-l-4 border-primary"
                      : "text-gray-700 hover:bg-gray-50"
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
                    className="w-full flex items-center justify-between px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {dropdown.label}
                    <CaretDown
                      size={16}
                      weight="bold"
                      className={`transition-transform duration-200 ${openDropdown === dropdown.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openDropdown === dropdown.label && (
                    <div className="bg-gray-50/50">
                      {dropdown.items.map((item) => (
                        <Link
                          key={item.name}
                          to={`/shop?category=${encodeURIComponent(item.category)}`}
                          className="block pl-10 pr-6 py-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
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
            <div className="border-t border-gray-100 p-4 flex gap-3">
              <Link
                to="/signin"
                className="flex-1 text-center py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
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
          </div>
        </div>
      )}
    </>
  );
}
