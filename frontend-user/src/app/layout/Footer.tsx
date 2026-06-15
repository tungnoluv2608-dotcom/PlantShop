import { Link } from "react-router"
import { Leaf, Mail, Share2 } from "lucide-react"
import { useAdvisorChatStore } from "@/stores/advisorChatStore"

const FOOTER_SECTIONS = [
  {
    title: "Cửa hàng",
    links: [
      { to: "/shop", label: "Tất cả cây" },
      { to: "/planters", label: "Chậu cây" },
      { to: "/accessories", label: "Phụ kiện" },
      { action: "advisor" as const, label: "Tư vấn AI" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { to: "/blog", label: "Blog chăm cây" },
      { to: "/wholesale", label: "Mua sỉ / B2B" },
      { to: "/vouchers", label: "Ưu đãi & Voucher" },
      { to: "/profile", label: "Tài khoản" },
    ],
  },
]

const PAYMENT_BADGES = ["COD", "PayOS", "VNPay"]

export function Footer() {
  const openChat = useAdvisorChatStore((s) => s.openChat)

  return (
    <footer className="mt-8 border-t border-border bg-secondary/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-4 sm:col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
            <Leaf className="size-6 text-primary" />
            PlantShop
          </Link>
          <p className="text-sm text-muted-foreground">
            Cây cảnh, chậu trồng và phụ kiện chăm cây cho không gian sống xanh.
          </p>
          <div className="flex gap-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Share2 className="size-4" />
            </a>
            <a
              href="mailto:support@plantshop.vn"
              aria-label="Email"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title}>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.label}>
                  {"action" in link ? (
                    <button
                      type="button"
                      onClick={openChat}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Liên hệ</h4>
          <p className="text-sm text-muted-foreground">support@plantshop.vn</p>
          <p className="text-sm text-muted-foreground">Hotline: 1900 1234</p>
          <p className="mt-3 text-xs text-muted-foreground">Giờ làm việc: 8:00 – 21:00</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {PAYMENT_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PlantShop. Trồng cây, gieo xanh.
      </div>
    </footer>
  )
}