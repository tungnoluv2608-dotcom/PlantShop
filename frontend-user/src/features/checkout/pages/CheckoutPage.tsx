import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { MapPin, Plus, Tag, X, ChevronRight, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { PaymentMethod, ShippingMethod, ValidateVoucherResponse } from "@/types"
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
import { validateVoucher } from "@/features/vouchers/api"
import { VoucherPickerSheet } from "@/features/vouchers/components/VoucherPickerSheet"

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
  const [searchParams, setSearchParams] = useSearchParams()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const clearCart = useCartStore((s) => s.clear)
  const { data: addresses } = useAddresses()

  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [appliedVoucher, setAppliedVoucher] = useState<ValidateVoucherResponse | null>(null)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)
  const deepLinkHandled = useRef(false)
  const createOrder = useCreateOrder()

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0]
      setSelectedAddressId(def.id)
    }
  }, [addresses, selectedAddressId])

  const cartItems = items.map((i) => ({ id: i.id, quantity: i.quantity }))

  const refreshAppliedVoucher = async (method: ShippingMethod, code: string) => {
    setIsValidatingVoucher(true)
    try {
      const result = await validateVoucher({
        code,
        items: cartItems,
        shippingMethod: method,
      })
      setAppliedVoucher(result)
    } catch (err) {
      setAppliedVoucher(null)
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsValidatingVoucher(false)
    }
  }

  useEffect(() => {
    if (!appliedVoucher?.code) return
    void refreshAppliedVoucher(shippingMethod, appliedVoucher.code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod, items])

  useEffect(() => {
    const codeFromUrl = searchParams.get("voucher")?.trim()
    if (!codeFromUrl || items.length === 0 || deepLinkHandled.current) return

    deepLinkHandled.current = true
    setIsValidatingVoucher(true)
    validateVoucher({
      code: codeFromUrl,
      items: cartItems,
      shippingMethod,
    })
      .then((result) => {
        setAppliedVoucher(result)
        toast.success(`Đã áp dụng mã ${result.code}`)
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => {
        setIsValidatingVoucher(false)
        const next = new URLSearchParams(searchParams)
        next.delete("voucher")
        setSearchParams(next, { replace: true })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, items.length])

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

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng")
      return
    }
    try {
      const result = await createOrder.mutateAsync({
        items: cartItems,
        shippingAddress: formatAddressLine(selectedAddress),
        shippingMethod,
        paymentMethod,
        voucherCode: appliedVoucher?.code,
        recipientName: selectedAddress.fullName,
        recipientPhone: selectedAddress.phone,
        province: selectedAddress.province,
        district: selectedAddress.district,
        ward: selectedAddress.ward,
        addressLine: selectedAddress.address,
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

  const displaySubtotal = appliedVoucher?.subtotal ?? subtotal
  const displayShippingFee = appliedVoucher?.shippingFee
  const displayDiscount = appliedVoucher?.discountAmount ?? 0
  const displayTotal = appliedVoucher?.total

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold">Thanh toán</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
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

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Tag className="size-4" />
                Mã giảm giá
              </div>
              {appliedVoucher ? (
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{appliedVoucher.code}</p>
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="mr-1 size-3" />
                        Đã áp dụng
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{appliedVoucher.voucherName}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRemoveVoucher} aria-label="Xóa voucher">
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/25 bg-primary/5 px-3.5 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-primary/8"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Tag className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-medium text-foreground">Chọn mã giảm giá</span>
                    <span className="block text-xs text-muted-foreground">
                      Xem mã khả dụng hoặc nhập mã
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              )}
              {appliedVoucher && (
                <Button
                  variant="link"
                  className="h-auto px-0 text-sm"
                  onClick={() => setPickerOpen(true)}
                >
                  Đổi mã khác
                </Button>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatVND(displaySubtotal)}</span>
              </div>
              {appliedVoucher && displayDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá voucher</span>
                  <span>-{formatVND(displayDiscount)}</span>
                </div>
              )}
              {appliedVoucher && appliedVoucher.discountType === "freeship" && (
                <div className="flex justify-between text-emerald-600">
                  <span>Miễn phí vận chuyển</span>
                  <span>Đã áp dụng</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span>
                  {displayShippingFee != null
                    ? formatVND(displayShippingFee)
                    : "Tính khi đặt hàng"}
                </span>
              </div>
              {displayTotal != null && (
                <>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Tổng cộng</span>
                    <span>{formatVND(displayTotal)}</span>
                  </div>
                </>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={createOrder.isPending || !selectedAddress || isValidatingVoucher}
            >
              {createOrder.isPending ? "Đang xử lý..." : "Đặt hàng"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <VoucherPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={cartItems}
        shippingMethod={shippingMethod}
        appliedCode={appliedVoucher?.code}
        onApplied={setAppliedVoucher}
      />
    </div>
  )
}