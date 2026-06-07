import { apiClient } from "@/lib/api-client"

/** Upload a single image. Returns the hosted URL. Requires auth (user token). */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("image", file)
  const { data } = await apiClient.post<{ url: string }>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data.url
}

/** Upload multiple images. Returns hosted URLs in order. */
export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append("images", file))
  const { data } = await apiClient.post<{ urls: string[] }>("/upload/multiple", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data.urls
}
