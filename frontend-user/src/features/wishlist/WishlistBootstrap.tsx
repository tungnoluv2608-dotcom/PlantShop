import { useWishlist } from "./api"

/**
 * Prefetches the authenticated user's wishlist on app boot so heart-toggle
 * state stays in sync with the server (not just stale localStorage).
 */
export function WishlistBootstrap() {
  useWishlist()
  return null
}