import { Link } from "react-router"
import { ArrowRight, Bot, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdvisorChatStore } from "@/stores/advisorChatStore"

export function HomeAdvisorCta() {
  const openChat = useAdvisorChatStore((s) => s.openChat)

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10">
        <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Bot className="size-4" />
              Tư vấn thông minh
            </span>
            <h2 className="mt-4 font-serif text-2xl font-semibold sm:text-3xl">
              Chưa biết chọn cây nào?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mô tả không gian, ánh sáng và thời gian chăm sóc — AI sẽ gợi ý cây phù hợp
              nhất cho bạn trong vài giây.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={openChat}>
                Tư vấn AI miễn phí <ArrowRight className="size-4" />
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/blog">
                  <BookOpen className="size-4" />
                  Đọc hướng dẫn chăm cây
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-3">
              {[
                "https://images.unsplash.com/photo-1459411552881-0e8b49d6d1b2?w=400&q=80",
                "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&q=80",
                "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80",
              ].map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden
                  className={`rounded-xl object-cover shadow-md ${i === 2 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}