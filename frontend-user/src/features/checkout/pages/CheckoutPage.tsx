import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { MapPin, Plus } from "lucide-react"
import { toast } from "sonner"
import type { PaymentMethod, ShippingMethod } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api-client"
import { useCartStore } from "@/stores/cartStore"
import { useAddresses } from "@/features/address/api"
import { AddressFormDialog } from "@/features/address/components/AddressFormDialog"
import { formatAddressLine } from "@/features/address/schema"
import { useCreateOrder, createPayosUrl, createVnpayUrl } from "@/features/orders/api"

const SHIPPING_METHODS: { value: ShippingMethod; label: string; note: string }[] = [
  { value: "standard", label: "Tiêu chuẩn", note: "2–4 ngày · miễn phí cho đơn lớn" },
  { value: "express", label: "Nhanh", note: "1–2 ngày" },
  { value: "sameday", label: "Trong ngày", note: "Nội thành" },
]

const PAYMENT_METHODS: { value: PaymentMethod; label: string; note: string }[] = [
  { value: "cod", label: "Thanh toán khi nhận hàng (COD)", note: "Trả tiền mặt khi giao" },
  { value: "payos", label: "PayOS", note: "Quét QR / chuyển khoản" },
  { value: "vnpay", label: "VNPay", note: "Thẻ ATM / QR ngân hàng" },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const clearCart = useCartStore((s) => s.clear)
  const { data: addresses } = useAddresses()

  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [dialogOpen, setDialogOpen] = useState(false)
  const createOrder = useCreateOrder()

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0]
      setSelectedAddressId(def.id)
    }
  }, [addresses, selectedAddressId])

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-muted-foreground">Giỏ hàng trống.</p>
        <Button asChild className="mt-4">
          <Link to="/shop">Về cửa hàng</Link>
        </Button>
      </div>
    )
  }

  const selectedAddress = addresses?.find((a) => a.id === selectedAddressId)

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng")
      return
    }
    try {
      const result = await createOrder.mutateAsync({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        shippingAddress: formatAddressLine(selectedAddress),
        shippingMethod,
        paymentMethod,
      })

      if (paymentMethod === "cod") {
        clearCart()
        toast.success(result.message)
        navigate(`/order-success/${result.orderId}`)
        return
      }
      if (paymentMethod === "vnpay") {
        const url = await createVnpayUrl(result.orderId)
        clearCart()
        window.location.href = url
        return
      }
      if (paymentMethod === "payos") {
        const { checkoutUrl } = await createPayosUrl(result.orderId, selectedAddress.phone)
        clearCart()
        window.location.href = checkoutUrl
        return
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold">Thanh toán</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Address */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="size-5" /> Địa chỉ giao hàng
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {addresses && addresses.length > 0 ? (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-2">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
                        selectedAddressId === address.id ? "border-primary bg-primary/5" : "border-border",
                      )}
                    >
                      <RadioGroupItem value={address.id} className="mt-1" />
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{address.label}</span>
                          {address.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                        </div>
                        <p>{address.fullName} · {address.phone}</p>
                        <p className="text-muted-foreground">{formatAddressLine(address)}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có địa chỉ. Vui lòng thêm địa chỉ giao hàng.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Phương thức vận chuyển</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={shippingMethod}
                onValueChange={(v) => setShippingMethod(v as ShippingMethod)}
                className="space-y-2"
              >
                {SHIPPING_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                      shippingMethod === m.value ? "border-primary bg-primary/5" : "border-border",
                    )}
                  >
                    <RadioGroupItem value={m.value} />
                    <div className="text-sm">
                      <p className="font-medium">{m.label}</p>
                      <p className="text-muted-foreground">{m.note}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="space-y-2"
              >
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                      paymentMethod === m.value ? "border-primary bg-primary/5" : "border-border",
                    )}
                  >
                    <RadioGroupItem value={m.value} />
                    <div className="text-sm">
                      <p className="font-medium">{m.label}</p>
                      <p className="text-muted-foreground">{m.note}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Đơn hàng ({items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.title} className="size-12 rounded-md object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{item.title}</p>
                    <p className="text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <span className="text-sm">{formatVND(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Phí vận chuyển và tổng cuối cùng được hệ thống tính chính xác khi đặt hàng.
            </p>
            <Separator />
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={createOrder.isPending || !selectedAddress}
            >
              {createOrder.isPending ? "Đang xử lý..." : "Đặt hàng"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
