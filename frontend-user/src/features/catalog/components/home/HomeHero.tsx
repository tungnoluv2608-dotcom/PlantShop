import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { motion } from "framer-motion"
import { ArrowRight, Search, Sparkles, Star, Truck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdvisorChatStore } from "@/stores/advisorChatStore"

const STATS = [
  { icon: Star, value: "4.8/5", label: "Đánh giá trung bình" },
  { icon: Users, value: "2.000+", label: "Khách hàng tin tưởng" },
  { icon: Truck, value: "2–3 ngày", label: "Giao toàn quốc" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
}

export function HomeHero() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const openChat = useAdvisorChatStore((s) => s.openChat)

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop")
  }

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Mobile background */}
      <img
        src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=1200&q=80"
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover md:hidden"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background md:hidden" />

      {/* Desktop gradient */}
      <div className="absolute inset-0 hidden bg-gradient-to-br from-primary/8 via-background to-accent/8 md:block" />
      <div className="pointer-events-none absolute -right-32 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-[360px] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:grid md:grid-cols-12 md:items-center md:gap-10 md:py-20 lg:py-24">
        <div className="md:col-span-5 lg:col-span-5">
          <motion.span
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          >
            <Sparkles className="size-4" />
            Không gian xanh cho mọi nhà
          </motion.span>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-5 font-serif text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-[3.25rem]"
          >
            Mang thiên nhiên vào từng góc sống
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg"
          >
            Cây cảnh, chậu trồng và phụ kiện được tuyển chọn kỹ — kèm tư vấn AI giúp bạn
            chọn đúng cây cho ánh sáng và diện tích thực tế.
          </motion.p>

          <motion.form
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            onSubmit={submitSearch}
            className="mt-6 flex max-w-md gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm cây, chậu, phụ kiện..."
                className="h-11 bg-background/90 pl-9 backdrop-blur"
              />
            </div>
            <Button type="submit" size="lg" className="shrink-0">
              Tìm
            </Button>
          </motion.form>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <Link to="/shop">
                Khám phá cửa hàng <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={openChat} className="bg-background/80 backdrop-blur">
              Tư vấn cây phù hợp
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative mt-10 hidden md:col-span-7 md:mt-0 lg:col-span-7"
        >
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=900&q=80"
              alt="Cây cảnh trong nhà"
              className="aspect-[5/6] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-border/50"
              width={720}
              height={864}
            />
            <div className="absolute -bottom-5 -left-5 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Star className="size-5 fill-accent text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">4.8 ★ từ khách hàng</p>
                  <p className="text-xs text-muted-foreground">Hơn 500 đánh giá xác thực</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-8 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
              <p className="text-xs text-muted-foreground">Giao hàng</p>
              <p className="font-semibold text-primary">Miễn phí đơn từ 500K</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative border-t border-border/60 bg-card/50 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </div>
              <div>
                <p className="font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}