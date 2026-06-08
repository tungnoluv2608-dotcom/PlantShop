import { Link } from "react-router"
import { ArrowRight, Sparkles, Truck, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdvisorChatStore } from "@/stores/advisorChatStore"
import { CategoryShowcase } from "../components/CategoryShowcase"
import { ProductRail } from "../components/ProductRail"
import { VoucherPromoBanner } from "@/features/vouchers/components/VoucherPromoBanner"

const FEATURES = [
  { icon: Leaf, title: "Cây khỏe, tươi mới", desc: "Tuyển chọn kỹ từ vườn ươm" },
  { icon: Truck, title: "Giao nhanh toàn quốc", desc: "Đóng gói an toàn cho cây" },
  { icon: Sparkles, title: "Tư vấn AI miễn phí", desc: "Chọn đúng cây cho không gian" },
]

export function HomePage() {
  const openChat = useAdvisorChatStore((s) => s.openChat)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="size-4" /> Không gian xanh cho mọi nhà
            </span>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Mang thiên nhiên vào trong từng góc sống
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Cây cảnh, chậu trồng và phụ kiện chăm cây được tuyển chọn kỹ lưỡng,
              kèm tư vấn AI giúp bạn chọn đúng cây.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">
                  Khám phá cửa hàng <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={openChat}>
                Tư vấn cây phù hợp
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=900&q=80"
              alt="Cây cảnh trong nhà"
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl"
              width={720}
              height={900}
            />
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <div>
                <p className="font-medium">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <VoucherPromoBanner />
      </section>

      <CategoryShowcase />
      <ProductRail
        title="Đang thịnh hành"
        description="Những cây được yêu thích nhất tuần này"
        sort="trending"
        viewAllHref="/shop?sort=trending"
      />
      <section className="bg-secondary/30">
        <ProductRail
          title="Đang giảm giá"
          description="Săn cây đẹp với giá tốt"
          sort="sale"
          saleOnly
          viewAllHref="/shop?saleOnly=true"
        />
      </section>
      <ProductRail
        title="Bán chạy nhất"
        sort="best-selling"
        viewAllHref="/shop?sort=best-selling"
      />
    </>
  )
}
