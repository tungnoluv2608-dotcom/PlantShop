import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router"
import { Heart, Leaf, Menu, Search, ShoppingBag, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCartStore } from "@/stores/cartStore"
import { useAuthStore } from "@/stores/authStore"

const NAV_LINKS = [
  { to: "/shop", label: "Cửa hàng" },
  { to: "/planters", label: "Chậu cây" },
  { to: "/accessories", label: "Phụ kiện" },
  { to: "/advisor", label: "Tư vấn AI" },
  { to: "/blog", label: "Blog" },
  { to: "/wholesale", label: "Mua sỉ" },
]

export function Navbar() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const totalItems = useCartStore((s) => s.totalItems())
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Leaf className="size-5 text-primary" /> PlantWeb
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1 px-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      isActive && "bg-primary/10 text-primary",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
          <Leaf className="size-6 text-primary" />
          <span>PlantWeb</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-primary",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm cây cảnh..."
              className="pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Button asChild variant="ghost" size="icon" aria-label="Yêu thích">
            <Link to="/wishlist">
              <Heart className="size-5" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Giỏ hàng">
            <Link to="/cart">
              <ShoppingBag className="size-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Tài khoản">
                  <User className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Tài khoản của tôi</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile?tab=orders">Đơn hàng</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/advisor/history">Lịch sử tư vấn</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearSession}>Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm" className="ml-1">
              <Link to="/signin">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
