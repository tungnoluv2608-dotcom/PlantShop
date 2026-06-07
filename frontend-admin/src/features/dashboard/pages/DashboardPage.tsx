import { useMemo } from "react"
import { Link } from "react-router"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ShoppingCart,
  Package,
  Users,
  Banknote,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import { formatVND, formatCompactVND, formatNumber, formatDate } from "@/lib/format"
import { useDashboardStats, useRecentOrders } from "../api"
import type { AdminOrderRow } from "@/types"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  accent: string
}

function StatCard({ title, value, icon: Icon, accent }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span
          className="flex size-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="size-5" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}

const revenueConfig = {
  revenue: { label: "Doanh thu", color: "var(--chart-1)" },
} satisfies ChartConfig

const ordersConfig = {
  count: { label: "Đơn hàng", color: "var(--chart-2)" },
} satisfies ChartConfig

/** Builds a revenue-by-day series from the recent orders feed. */
function buildRevenueSeries(orders: AdminOrderRow[]) {
  const byDate = new Map<string, { revenue: number; count: number }>()
  for (const order of orders) {
    if (order.status === "cancelled") continue
    const key = order.date
    const prev = byDate.get(key) ?? { revenue: 0, count: 0 }
    byDate.set(key, {
      revenue: prev.revenue + (order.total ?? 0),
      count: prev.count + 1,
    })
  }
  return Array.from(byDate.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: orders, isLoading: ordersLoading } = useRecentOrders()

  const series = useMemo(() => buildRevenueSeries(orders ?? []), [orders])
  const recent = useMemo(
    () => (orders ?? []).slice(0, 6),
    [orders]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều khiển"
        description="Tổng quan hoạt động kinh doanh của PlantWeb."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Tổng đơn hàng"
              value={formatNumber(stats.totalOrders)}
              icon={ShoppingCart}
              accent="oklch(0.46 0.1 150)"
            />
            <StatCard
              title="Sản phẩm"
              value={formatNumber(stats.totalProducts)}
              icon={Package}
              accent="oklch(0.6 0.13 250)"
            />
            <StatCard
              title="Khách hàng"
              value={formatNumber(stats.totalCustomers)}
              icon={Users}
              accent="oklch(0.65 0.13 90)"
            />
            <StatCard
              title="Doanh thu"
              value={formatVND(stats.totalRevenue)}
              icon={Banknote}
              accent="oklch(0.7 0.12 55)"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Doanh thu gần đây</CardTitle>
            <CardDescription>14 ngày gần nhất (theo đơn hàng)</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : series.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu đơn hàng.
              </p>
            ) : (
              <ChartContainer config={revenueConfig} className="h-[260px] w-full">
                <AreaChart data={series} margin={{ left: 4, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => formatDate(v).slice(0, 5)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v) => formatCompactVND(Number(v))}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(v) => formatDate(String(v))}
                        formatter={(value) => formatVND(Number(value))}
                      />
                    }
                  />
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    fill="url(#fillRevenue)"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Đơn hàng theo ngày</CardTitle>
            <CardDescription>Số lượng đơn 14 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : series.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu.
              </p>
            ) : (
              <ChartContainer config={ordersConfig} className="h-[260px] w-full">
                <BarChart data={series} margin={{ left: 4, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => formatDate(v).slice(0, 5)}
                  />
                  <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(v) => formatDate(String(v))}
                      />
                    }
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Đơn hàng mới nhất</CardTitle>
            <CardDescription>6 đơn hàng gần đây</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/orders">
              Xem tất cả <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {ordersLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))
          ) : recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có đơn hàng.
            </p>
          ) : (
            recent.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{order.id}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {order.customerName} · {formatDate(order.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold">{formatVND(order.total)}</span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
