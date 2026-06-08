import type { OrderStatus } from "@/types"

export const WORKFLOW_STEPS = [
  { status: "confirmed" as const, label: "Xác nhận" },
  { status: "packing" as const, label: "Đóng gói" },
  { status: "shipping" as const, label: "Giao VC" },
  { status: "delivered" as const, label: "Đã giao" },
] as const

export type WorkflowStepStatus = (typeof WORKFLOW_STEPS)[number]["status"]

export function getWorkflowStepIndex(status: OrderStatus): number {
  return WORKFLOW_STEPS.findIndex((step) => step.status === status)
}

export function getNextStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case "confirmed":
      return "packing"
    case "packing":
      return "shipping"
    case "shipping":
      return "delivered"
    default:
      return null
  }
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "delivered" || status === "cancelled" || status === "returning"
}

export function getPrimaryActionLabel(status: OrderStatus): string | null {
  switch (status) {
    case "confirmed":
      return "Bắt đầu đóng gói"
    case "packing":
      return "Giao cho đơn vị VC"
    case "shipping":
      return "Đã giao thành công"
    default:
      return null
  }
}

export function getActionHint(status: OrderStatus): string | null {
  switch (status) {
    case "confirmed":
      return "Gợi ý: in phiếu soạn hàng trước khi đóng gói."
    case "packing":
      return "Tạo vận đơn trên GHN/GHTK, nhập mã rồi xác nhận giao VC. Có thể in nhãn trước hoặc sau khi có mã."
    case "shipping":
      return "Xác nhận khi shipper báo giao thành công cho khách."
    default:
      return null
  }
}