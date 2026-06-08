import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

function readValues<T extends Record<string, string>>(
  searchParams: URLSearchParams,
  defaults: T
): T {
  const result = { ...defaults }
  for (const key of Object.keys(defaults) as Array<keyof T & string>) {
    result[key] = (searchParams.get(key) ?? defaults[key]) as T[typeof key]
  }
  return result
}

function isActiveValue(value: string, defaultValue: string): boolean {
  return value !== defaultValue && value !== ""
}

/** Syncs list filter state with URL search params (shareable deep links). */
export function useListFilters<T extends Record<string, string>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams()

  const values = useMemo(
    () => readValues(searchParams, defaults) as T,
    [searchParams, defaults]
  )

  const setFilter = useCallback(
    (key: string, value: string) => {
      const defaultValue = defaults[key] ?? ""
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (!value || value === defaultValue) {
            next.delete(key)
          } else {
            next.set(key, value)
          }
          return next
        },
        { replace: true }
      )
    },
    [defaults, setSearchParams]
  )

  const setFilters = useCallback(
    (updates: Partial<Record<string, string>>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            const defaultValue = defaults[key] ?? ""
            if (!value || value === defaultValue) {
              next.delete(key)
            } else {
              next.set(key, value)
            }
          }
          return next
        },
        { replace: true }
      )
    },
    [defaults, setSearchParams]
  )

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const hasActiveFilters = useMemo(
    () =>
      Object.entries(defaults).some(([key, defaultValue]) =>
        isActiveValue(searchParams.get(key) ?? defaultValue, defaultValue)
      ),
    [defaults, searchParams]
  )

  const activeCount = useMemo(
    () =>
      Object.entries(defaults).filter(([key, defaultValue]) =>
        isActiveValue(searchParams.get(key) ?? defaultValue, defaultValue)
      ).length,
    [defaults, searchParams]
  )

  return {
    values,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters,
    activeCount,
  }
}