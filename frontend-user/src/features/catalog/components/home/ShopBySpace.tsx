import { Link } from "react-router"
import { ArrowRight, Building2, Gift, Home, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface SpaceOption {
  icon: LucideIcon
  title: string
  desc: string
  href: string
  image: string
}

const SPACES: SpaceOption[] = [
  {
    icon: Building2,
    title: "Văn phòng",
    desc: "Cây lọc không khí, ít cần chăm",
    href: "/shop?search=văn phòng",
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&q=80",
  },
  {
    icon: Home,
    title: "Phòng khách",
    desc: "Cây trang trí, tạo điểm nhấn",
    href: "/shop?search=phòng khách",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
  },
  {
    icon: Sun,
    title: "Ban công",
    desc: "Chịu nắng, phù hợp ngoài trời",
    href: "/shop?search=ban công",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  },
  {
    icon: Gift,
    title: "Quà tặng",
    desc: "Set cây đẹp, ý nghĩa",
    href: "/shop?search=quà tặng",
    image: "https://images.unsplash.com/photo-1463320721487-4a77b7113315?w=600&q=80",
  },
]

export function ShopBySpace() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">Mua theo không gian</h2>
          <p className="mt-1 text-muted-foreground">
            Gợi ý cây phù hợp từng khu vực trong nhà và nơi làm việc
          </p>
        </div>
        <Link
          to="/shop"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          Xem tất cả <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SPACES.map((space) => (
          <Link
            key={space.title}
            to={space.href}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border"
          >
            <img
              src={space.image}
              alt={space.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                <space.icon className="size-4" />
              </div>
              <h3 className="font-semibold">{space.title}</h3>
              <p className="mt-0.5 text-sm text-white/80">{space.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                Khám phá <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}