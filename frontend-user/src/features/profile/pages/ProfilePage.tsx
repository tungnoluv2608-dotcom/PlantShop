import { Link, useSearchParams } from "react-router"
import { LogOut, Package, TicketPercent } from "lucide-react"
import { VouchersTab } from "@/features/vouchers/components/VouchersTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/EmptyState"
import { formatVND, formatDate } from "@/lib/format"
import { useAuthStore } from "@/stores/authStore"
import { useOrders } from "@/features/orders/api"
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge"
import { AddressManager } from "@/features/address/components/AddressManager"

function OrdersTab() {
  const { data: orders, isLoading } = useOrders()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }
  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Chưa có đơn hàng"
        description="Các đơn hàng của bạn sẽ hiển thị ở đây."
        action={
          <Button asChild>
            <Link to="/shop">Mua sắm ngay</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          to={`/orders/${order.id}`}
          className="block rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{order.id}</p>
              <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="font-semibold">{formatVND(order.total)}</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {order.items.length} sản phẩm
          </p>
        </Link>
      ))}
    </div>
  )
}

export function ProfilePage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get("tab") ?? "account"
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold">Tài khoản của tôi</h1>

      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
        <TabsList>
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="addresses">Địa chỉ</TabsTrigger>
          <TabsTrigger value="vouchers">Kho voucher</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Họ tên</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setParams({ tab: "orders" })}>
                  <Package className="size-4" />
                  Đơn hàng
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/vouchers">
                    <TicketPercent className="size-4" />
                    Kho voucher
                  </Link>
                </Button>
              </div>
              <Button variant="outline" onClick={clearSession}>
                <LogOut className="size-4" /> Đăng xuất
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersTab />
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <AddressManager />
        </TabsContent>

        <TabsContent value="vouchers" className="mt-6">
          <VouchersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
