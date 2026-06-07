import { Link } from "react-router"
import { Leaf } from "lucide-react"
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
      { to: "/profile", label: "Tài khoản" },
    ],
  },
]

export function Footer() {
  const openChat = useAdvisorChatStore((s) => s.openChat)

  return (
    <footer className="mt-20 border-t border-border bg-secondary/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
            <Leaf className="size-6 text-primary" />
            PlantShop
          </Link>
          <p className="text-sm text-muted-foreground">
            Cây cảnh, chậu trồng và phụ kiện chăm cây cho không gian sống xanh.
          </p>
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
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PlantShop. Trồng cây, gieo xanh.
      </div>
    </footer>
  )
}