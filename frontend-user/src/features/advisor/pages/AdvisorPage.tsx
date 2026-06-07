import { useState } from "react"
import { Link } from "react-router"
import { Sparkles, History } from "lucide-react"
import { toast } from "sonner"
import type { AdvisorRequest, LightLevel, AdvisorPriority } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-client"
import { useAuthStore } from "@/stores/authStore"
import { useAdvisor } from "../api"
import { RecommendationCard } from "../components/RecommendationCard"

export function AdvisorPage() {
  const advisor = useAdvisor()
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))

  const [budget, setBudget] = useState("")
  const [lightLevel, setLightLevel] = useState<LightLevel>("medium")
  const [priority, setPriority] = useState<AdvisorPriority>("easy-care")
  const [hasPets, setHasPets] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: AdvisorRequest = {
      budget: budget ? Number(budget) : undefined,
      lightLevel,
      hasPets,
      priority,
      customPrompt: customPrompt.trim() || undefined,
    }
    advisor.mutate(payload, {
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="size-4" /> Trợ lý cây xanh AI
        </span>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Tìm cây phù hợp với bạn</h1>
        <p className="mt-2 text-muted-foreground">
          Cho chúng tôi biết nhu cầu, AI sẽ gợi ý những cây hợp nhất.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              Nhu cầu của bạn
              {isAuthenticated && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/advisor/history">
                    <History className="size-4" /> Lịch sử
                  </Link>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Ngân sách (đ)</Label>
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  placeholder="vd: 500000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Mức sáng</Label>
                <Select value={lightLevel} onValueChange={(v) => setLightLevel(v as LightLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Ít sáng</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="bright">Nhiều sáng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ưu tiên</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as AdvisorPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy-care">Dễ chăm sóc</SelectItem>
                    <SelectItem value="decor">Trang trí đẹp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasPets"
                  checked={hasPets}
                  onCheckedChange={(c) => setHasPets(Boolean(c))}
                />
                <Label htmlFor="hasPets" className="cursor-pointer">
                  Nhà có thú cưng
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPrompt">Mô tả thêm</Label>
                <Textarea
                  id="customPrompt"
                  rows={3}
                  placeholder="vd: Muốn cây nhỏ gọn để bàn làm việc"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={advisor.isPending}>
                {advisor.isPending ? "Đang phân tích..." : "Nhận gợi ý"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {advisor.isPending && (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          )}

          {advisor.data && (
            <>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed">{advisor.data.summary}</p>
                </CardContent>
              </Card>
              {advisor.data.recommendations.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} />
              ))}
            </>
          )}

          {!advisor.isPending && !advisor.data && (
            <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-border text-center text-muted-foreground">
              <p>Điền thông tin bên trái để nhận gợi ý cây phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
