import { Link, useNavigate } from "react-router"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/common/EmptyState"
import { formatVND } from "@/lib/format"
import { useCartStore } from "@/stores/cartStore"
import { useAuthStore } from "@/stores/authStore"

export function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotal = useCartStore((s) => s.subtotal())
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))

  const goToCheckout = () => {
    navigate(isAuthenticated ? "/checkout" : "/signin", {
      state: isAuthenticated ? undefined : { from: "/checkout" },
    })
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Giỏ hàng trống"
          description="Khám phá cửa hàng và thêm những cây bạn yêu thích."
          action={
            <Button asChild>
              <Link to="/shop">Bắt đầu mua sắm</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold">Giỏ hàng</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <img
                src={item.image}
                alt={item.title}
                className="size-24 shrink-0 rounded-lg object-cover"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    {item.planter && item.planter !== "Không" && (
                      <p className="text-sm text-muted-foreground">{item.planter}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    aria-label="Xóa"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <span className="font-semibold">{formatVND(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Tóm tắt đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Phí vận chuyển và tổng cuối được tính ở bước thanh toán.
            </p>
            <Separator />
            <Button className="w-full" size="lg" onClick={goToCheckout}>
              Tiến hành thanh toán
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/shop">Tiếp tục mua sắm</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
