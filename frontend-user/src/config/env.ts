/**
 * Centralized, validated environment config. Fails fast at startup if a
 * required variable is missing so we never ship a half-configured client.
 */

function required(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
} as const
