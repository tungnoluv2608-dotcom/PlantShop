import axios, { AxiosError } from "axios"
import { env } from "@/config/env"
import { useAuthStore } from "@/stores/authStore"

/**
 * Single axios instance for the whole storefront.
 * - request interceptor attaches the customer Bearer token
 * - response interceptor normalizes the backend `{ message }` error shape
 *   and clears the session on 401.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(error)
  },
)

/** Extract a human-readable message from any thrown API error. */
export function getApiErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra."): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
