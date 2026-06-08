import { matchesTextSearch, matchesTriState, type TriState } from "@/lib/filters"
import type { Category } from "@/types"

export interface CategoryFilterState {
  [key: string]: string
  q: string
  hasSubcategories: TriState
  hasImage: TriState
  sort: string
}

export const CATEGORY_FILTER_DEFAULTS: CategoryFilterState = {
  q: "",
  hasSubcategories: "all",
  hasImage: "all",
  sort: "name_asc",
}

export function filterCategories(
  categories: Category[],
  filters: CategoryFilterState
): Category[] {
  const rows = categories.filter((category) => {
    if (!matchesTriState(category.subcategories.length > 0, filters.hasSubcategories)) {
      return false
    }
    if (!matchesTriState(Boolean(category.image?.trim()), filters.hasImage)) {
      return false
    }
    return matchesTextSearch(filters.q, [
      category.name,
      ...category.subcategories,
    ])
  })

  return sortCategories(rows, filters.sort)
}

function sortCategories(categories: Category[], sort: string): Category[] {
  const sorted = [...categories]
  switch (sort) {
    case "subcategories_desc":
      return sorted.sort(
        (a, b) => b.subcategories.length - a.subcategories.length
      )
    case "name_desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "vi"))
    case "name_asc":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"))
  }
}