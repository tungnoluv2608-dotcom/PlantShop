import axios, { AxiosError } from "axios"
import { env } from "@/config/env"
import { useAdminAuthStore } from "@/stores/adminAuthStore"

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAdminAuthStore.getState().clearSession()
    }
    return Promise.reject(error)
  }
)

/** Normalizes an axios error into the backend's `message` field when present. */
export function getApiErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra"): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
