import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/copy"

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

export function CopyButton({ value, label = "Đã sao chép", className }: CopyButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className ?? "size-8 shrink-0"}
      disabled={!value || value === "—"}
      onClick={async (e) => {
        e.stopPropagation()
        try {
          await copyToClipboard(value)
          toast.success(label)
        } catch {
          toast.error("Không thể sao chép.")
        }
      }}
    >
      <Copy className="size-4" />
      <span className="sr-only">Sao chép</span>
    </Button>
  )
}