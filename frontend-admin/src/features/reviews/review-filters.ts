import {
  matchesDateRange,
  matchesTextSearch,
  matchesTriState,
  type TriState,
} from "@/lib/filters"
import type { AdminReview } from "@/types"

export interface ReviewFilterState {
  [key: string]: string
  q: string
  rating: string
  verified: TriState
  visible: TriState
  hasImages: TriState
  dateFrom: string
  dateTo: string
  sort: string
}

export const REVIEW_FILTER_DEFAULTS: ReviewFilterState = {
  q: "",
  rating: "all",
  verified: "all",
  visible: "all",
  hasImages: "all",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
}

export function filterReviews(
  reviews: AdminReview[],
  filters: ReviewFilterState
): AdminReview[] {
  const rows = reviews.filter((review) => {
    if (filters.rating !== "all" && review.rating !== Number(filters.rating)) {
      return false
    }
    if (!matchesTriState(review.verified, filters.verified)) return false
    if (!matchesTriState(review.visible, filters.visible)) return false
    if (!matchesTriState(review.images.length > 0, filters.hasImages)) return false
    if (!matchesDateRange(review.createdAt, filters.dateFrom, filters.dateTo)) {
      return false
    }
    return matchesTextSearch(filters.q, [
      review.productTitle,
      review.userName,
      review.title,
      review.content,
      ...review.tags,
    ])
  })

  return sortReviews(rows, filters.sort)
}

function sortReviews(reviews: AdminReview[], sort: string): AdminReview[] {
  const sorted = [...reviews]
  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case "rating_asc":
      return sorted.sort((a, b) => a.rating - b.rating)
    case "rating_desc":
      return sorted.sort((a, b) => b.rating - a.rating)
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}