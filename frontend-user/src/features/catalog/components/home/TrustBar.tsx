import { Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react"

const TRUST_ITEMS = [
  {
    icon: Leaf,
    title: "Kiểm tra trước khi giao",
    desc: "Cây khỏe, lá tươi · Bảo hành 7 ngày",
  },
  {
    icon: Truck,
    title: "Đóng gói chống sốc",
    desc: "Giao 63 tỉnh thành · Theo dõi đơn realtime",
  },
  {
    icon: Sparkles,
    title: "AI gợi ý theo không gian",
    desc: "Ánh sáng, diện tích & mức chăm sóc",
  },
  {
    icon: ShieldCheck,
    title: "Thanh toán an toàn",
    desc: "COD · PayOS · VNPay · Đổi trả dễ dàng",
  },
]

export function TrustBar() {
  return (
    <section className="border-b border-border bg-secondary/20">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/30 hover:bg-card"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <item.icon className="size-5" />
            </div>
            <div>
              <p className="font-medium leading-snug">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}