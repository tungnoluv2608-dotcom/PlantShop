import { useState } from "react"
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { ShippingAddress } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/EmptyState"
import { getApiErrorMessage } from "@/lib/api-client"
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from "../api"
import { AddressFormDialog } from "./AddressFormDialog"

export function AddressManager() {
  const { data: addresses, isLoading } = useAddresses()
  const deleteAddress = useDeleteAddress()
  const setDefault = useSetDefaultAddress()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ShippingAddress | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (address: ShippingAddress) => {
    setEditing(address)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sổ địa chỉ</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> Thêm địa chỉ
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{address.label}</span>
                  {address.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                </div>
                <p className="text-sm">
                  {address.fullName} · {address.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[address.address, address.ward, address.district, address.province]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Đặt mặc định"
                    onClick={() => setDefault.mutate(address.id)}
                  >
                    <Star className="size-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => openEdit(address)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Xóa"
                  onClick={() =>
                    deleteAddress.mutate(address.id, {
                      onSuccess: () => toast.success("Đã xóa địa chỉ"),
                      onError: (err) => toast.error(getApiErrorMessage(err)),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="Chưa có địa chỉ"
          description="Thêm địa chỉ để thanh toán nhanh hơn."
          action={<Button onClick={openCreate}>Thêm địa chỉ</Button>}
        />
      )}

      <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
    </div>
  )
}
