/** Display formatters shared across the admin panel. */

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

const COMPACT_VND = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatVND(value: number): string {
  return VND.format(value ?? 0)
}

export function formatCompactVND(value: number): string {
  return `${COMPACT_VND.format(value ?? 0)}₫`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0)
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function parseWallClockDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (match) {
    const [, year, month, day, hour, minute] = match
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    )
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDateTime(value: string | Date): string {
  const date = parseWallClockDate(value)
  if (!date) return String(value)
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
})

const SHORT_DATETIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

/** Time only, e.g. 14:12 */
export function formatTime(value: string | Date): string {
  const date = parseWallClockDate(value)
  if (!date) return String(value)
  return TIME_FORMATTER.format(date)
}

/** Compact date+time for tables, e.g. 15/06 14:12 */
export function formatShortDateTime(value: string | Date): string {
  const date = parseWallClockDate(value)
  if (!date) return String(value)
  return SHORT_DATETIME_FORMATTER.format(date)
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export interface VoucherPeriodDisplay {
  primary: string
  secondary?: string
}

/** Human-friendly voucher validity range for admin tables. */
export function formatVoucherPeriod(startsAt: string, expiresAt: string): VoucherPeriodDisplay {
  const start = parseWallClockDate(startsAt)
  const end = parseWallClockDate(expiresAt)
  if (!start || !end) {
    return { primary: `${startsAt} → ${expiresAt}` }
  }

  if (isSameCalendarDay(start, end)) {
    return {
      primary: `${formatTime(start)} → ${formatTime(end)}`,
      secondary: formatDate(start),
    }
  }

  return {
    primary: `${formatShortDateTime(start)} → ${formatShortDateTime(end)}`,
    secondary: `${formatDate(start)} – ${formatDate(end)}`,
  }
}
