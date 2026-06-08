import { formatVND, formatDateTime } from "@/lib/format"
import type { AdminOrderDetail, ShopPrintConfig } from "@/types"
import {
  formatCodLine,
  getShippingMethodLabel,
  resolveRecipient,
} from "./order-display"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function resolvePrintNote(order: AdminOrderDetail, settings: ShopPrintConfig): string | null {
  const orderNote = String(order.internalNote || "").trim()
  const defaultNote = String(settings.defaultNote || "").trim()
  return orderNote || defaultNote || null
}

function buildShopHeader(settings: ShopPrintConfig): string {
  const logo = settings.logoUrl?.trim()
  return `
    <div class="label-header">
      <div class="shop-brand">
        ${
          logo
            ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(settings.shopName)}" class="shop-logo" />`
            : ""
        }
        <div>
          <div class="shop-name">${escapeHtml(settings.shopName)}</div>
          <div class="shop-meta">${escapeHtml(settings.shopPhone)}</div>
        </div>
      </div>
    </div>
  `
}

const PRINT_BASE_STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  @media print {
    body { margin: 0; }
    .page { page-break-after: always; }
  }
`

function buildShippingLabelPage(order: AdminOrderDetail, settings: ShopPrintConfig): string {
  const recipient = resolveRecipient(order)
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const trackingNumber = String(order.trackingNumber || "").trim()
  const trackingDisplay = trackingNumber || "_______________________"
  const printNote = resolvePrintNote(order, settings)

  return `
    <section class="label-page page">
      <div class="label">
        ${buildShopHeader(settings)}
        <div class="order-id-block">
          <div class="section-title">MÃ ĐƠN HÀNG</div>
          <div class="order-id-large">${escapeHtml(order.id)}</div>
        </div>
        <div class="tracking-box ${trackingNumber ? "has-tracking" : "empty-tracking"}">
          <div class="section-title">MÃ VẬN ĐƠN (điền sau khi tạo trên GHN/GHTK)</div>
          <div class="tracking-value">${escapeHtml(trackingDisplay)}</div>
          ${
            order.trackingProvider && trackingNumber
              ? `<div class="tracking-provider">${escapeHtml(order.trackingProvider.toUpperCase())}</div>`
              : ""
          }
        </div>
        <div class="section">
          <div class="section-title">NGƯỜI NHẬN</div>
          <div class="recipient-name">${escapeHtml(recipient.name)} · ${escapeHtml(recipient.phone)}</div>
          <div class="recipient-address">${escapeHtml(recipient.address)}</div>
        </div>
        <div class="grid">
          <div><span class="muted">COD</span><br/><strong>${escapeHtml(formatCodLine(order.paymentMethod, order.total))}</strong></div>
          <div><span class="muted">Số lượng</span><br/><strong>${itemCount} SP</strong></div>
          <div><span class="muted">Vận chuyển</span><br/><strong>${escapeHtml(getShippingMethodLabel(order.shippingMethod))}</strong></div>
          <div><span class="muted">Thanh toán</span><br/><strong>${escapeHtml(order.paymentMethod.toUpperCase())}</strong></div>
        </div>
        ${
          printNote
            ? `<div class="note">Ghi chú: ${escapeHtml(printNote)}</div>`
            : ""
        }
        <div class="sender">
          <span class="muted">Người gửi</span><br/>
          ${escapeHtml(settings.shopName)} · ${escapeHtml(settings.shopPhone)}<br/>
          ${escapeHtml(settings.shopAddress)}
        </div>
      </div>
    </section>
  `
}

function buildPackingSlipPage(order: AdminOrderDetail, settings: ShopPrintConfig): string {
  const recipient = resolveRecipient(order)
  const printNote = resolvePrintNote(order, settings)
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td class="qty">${item.quantity}</td>
          <td>
            <div class="item-title">${escapeHtml(item.title)}</div>
            ${item.planter ? `<div class="item-sub">${escapeHtml(item.planter)}</div>` : ""}
          </td>
          <td class="price">${escapeHtml(formatVND(item.price))}</td>
          <td class="price">${escapeHtml(formatVND(item.price * item.quantity))}</td>
        </tr>
      `
    )
    .join("")

  return `
    <section class="slip-page page">
      <div class="slip">
        <div class="slip-header">
          <div class="shop-brand">
            ${
              settings.logoUrl
                ? `<img src="${escapeHtml(settings.logoUrl)}" alt="${escapeHtml(settings.shopName)}" class="shop-logo" />`
                : ""
            }
            <div>
              <div class="shop-name">${escapeHtml(settings.shopName)}</div>
              <div class="muted">Phiếu soạn hàng</div>
            </div>
          </div>
          <div class="slip-meta">
            <div><strong>${escapeHtml(order.id)}</strong></div>
            <div class="muted">${escapeHtml(formatDateTime(order.date))}</div>
          </div>
        </div>
        <div class="info-grid">
          <div>
            <div class="muted">Khách nhận</div>
            <div>${escapeHtml(recipient.name)} · ${escapeHtml(recipient.phone)}</div>
            <div>${escapeHtml(recipient.address)}</div>
          </div>
          <div>
            <div class="muted">Giao hàng</div>
            <div>${escapeHtml(getShippingMethodLabel(order.shippingMethod))}</div>
            <div>COD: ${escapeHtml(formatCodLine(order.paymentMethod, order.total))}</div>
          </div>
        </div>
        ${
          printNote
            ? `<div class="note-box"><strong>Ghi chú:</strong> ${escapeHtml(printNote)}</div>`
            : ""
        }
        <table>
          <thead>
            <tr>
              <th class="qty">SL</th>
              <th>Sản phẩm</th>
              <th class="price">Đơn giá</th>
              <th class="price">Thành tiền</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div class="totals">
          <div><span>Tạm tính</span><span>${escapeHtml(formatVND(order.subtotal))}</span></div>
          <div><span>Phí ship</span><span>${escapeHtml(formatVND(order.shippingFee))}</span></div>
          <div class="grand"><span>Tổng</span><span>${escapeHtml(formatVND(order.total))}</span></div>
        </div>
        <div class="sender-line muted">${escapeHtml(settings.shopName)} · ${escapeHtml(settings.shopPhone)} · ${escapeHtml(settings.shopAddress)}</div>
        <div class="checklist">
          <label><span class="box"></span> Đã kiểm tra số lượng</label>
          <label><span class="box"></span> Đã đóng gói cẩn thận</label>
          <label><span class="box"></span> Đã dán nhãn vận chuyển</label>
        </div>
      </div>
    </section>
  `
}

const LABEL_STYLES = `
  .label-page { padding: 8mm; }
  .label {
    width: 100mm;
    min-height: 148mm;
    border: 1px solid #222;
    padding: 8mm;
    display: flex;
    flex-direction: column;
    gap: 5mm;
  }
  .shop-brand { display: flex; align-items: center; gap: 8px; }
  .shop-logo { width: 36px; height: 36px; object-fit: contain; }
  .shop-name { font-size: 18px; font-weight: 700; }
  .shop-meta, .muted { color: #555; font-size: 12px; }
  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #555; margin-bottom: 4px; }
  .order-id-block { border: 1px solid #222; padding: 8px; text-align: center; }
  .order-id-large { font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 0.04em; }
  .tracking-box { border: 2px dashed #666; padding: 10px; text-align: center; }
  .tracking-box.has-tracking { border-style: solid; border-color: #222; }
  .tracking-value { font-family: monospace; font-size: 18px; font-weight: 700; margin-top: 4px; }
  .tracking-provider { font-size: 11px; color: #555; margin-top: 4px; }
  .recipient-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .recipient-address { font-size: 14px; line-height: 1.45; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
  .note { font-size: 13px; padding: 8px; background: #f5f5f5; border-radius: 6px; }
  .sender { margin-top: auto; font-size: 12px; line-height: 1.45; border-top: 1px dashed #bbb; padding-top: 8px; }
`

const SLIP_STYLES = `
  .slip-page { padding: 12mm; }
  .slip { max-width: 190mm; margin: 0 auto; }
  .slip-header, .info-grid { display: flex; justify-content: space-between; gap: 16px; }
  .shop-brand { display: flex; align-items: center; gap: 10px; }
  .shop-logo { width: 42px; height: 42px; object-fit: contain; }
  .info-grid { margin: 12px 0; font-size: 13px; line-height: 1.5; }
  .slip-meta { text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th, td { border-bottom: 1px solid #ddd; padding: 8px 6px; vertical-align: top; }
  th { text-align: left; background: #f7f7f7; }
  .qty { width: 48px; text-align: center; }
  .price { width: 110px; text-align: right; white-space: nowrap; }
  .item-title { font-weight: 600; }
  .item-sub { color: #666; font-size: 12px; margin-top: 2px; }
  .totals { margin-top: 12px; width: 260px; margin-left: auto; font-size: 13px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .grand { font-size: 16px; font-weight: 700; border-top: 1px solid #222; margin-top: 4px; padding-top: 8px; }
  .note-box { background: #fff8e1; border: 1px solid #f0d98c; padding: 8px 10px; border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
  .sender-line { margin-top: 12px; font-size: 12px; }
  .checklist { margin-top: 18px; display: flex; gap: 18px; font-size: 13px; }
  .box { display: inline-block; width: 14px; height: 14px; border: 1px solid #222; margin-right: 6px; vertical-align: middle; }
`

function printHtmlDocument(title: string, bodyHtml: string, extraStyles: string) {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("title", title)
  iframe.setAttribute("aria-hidden", "true")
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  })
  document.body.appendChild(iframe)

  const frameWindow = iframe.contentWindow
  const doc = frameWindow?.document
  if (!doc || !frameWindow) {
    iframe.remove()
    throw new Error("Không thể mở khung in.")
  }

  let cleanedUp = false
  const cleanup = () => {
    if (cleanedUp) return
    cleanedUp = true
    iframe.remove()
  }

  frameWindow.addEventListener("afterprint", cleanup, { once: true })

  doc.open()
  doc.write(`<!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>${PRINT_BASE_STYLES}${extraStyles}</style>
      </head>
      <body>${bodyHtml}</body>
    </html>`)
  doc.close()

  window.setTimeout(() => {
    frameWindow.focus()
    frameWindow.print()
    window.setTimeout(cleanup, 60_000)
  }, 150)
}

export function printShippingLabels(
  orders: AdminOrderDetail[],
  settings: ShopPrintConfig
) {
  if (orders.length === 0) return
  const html = orders.map((order) => buildShippingLabelPage(order, settings)).join("")
  printHtmlDocument(`Nhãn giao hàng (${orders.length})`, html, LABEL_STYLES)
}

export function printPackingSlips(orders: AdminOrderDetail[], settings: ShopPrintConfig) {
  if (orders.length === 0) return
  const html = orders.map((order) => buildPackingSlipPage(order, settings)).join("")
  printHtmlDocument(`Phiếu soạn hàng (${orders.length})`, html, SLIP_STYLES)
}

export function countOrdersWithoutTracking(orders: AdminOrderDetail[]): number {
  return orders.filter((order) => !String(order.trackingNumber || "").trim()).length
}