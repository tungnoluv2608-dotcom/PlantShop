import { useState } from "react"
import { Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "plantshop-newsletter"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Vui lòng nhập email hợp lệ")
      return
    }
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]
      if (!existing.includes(trimmed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, trimmed]))
      }
      toast.success("Đã đăng ký nhận ưu đãi!", {
        description: "Chúng tôi sẽ gửi mã giảm giá khi có chương trình mới.",
      })
      setEmail("")
    } catch {
      toast.success("Đã đăng ký nhận ưu đãi!")
      setEmail("")
    }
  }

  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold sm:text-2xl">Nhận ưu đãi qua email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Đăng ký để nhận mã giảm giá, mẹo chăm cây và sản phẩm mới mỗi tuần.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="h-11 flex-1"
              aria-label="Email đăng ký nhận ưu đãi"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Đăng ký
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Không spam. Bạn có thể hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
      </div>
    </section>
  )
}