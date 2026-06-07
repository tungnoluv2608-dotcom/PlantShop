import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { User } from "@/types"

interface AuthResponse {
  token: string
  user: User
}

interface SignInPayload {
  email: string
  password: string
}

interface SignUpPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
}

async function signin(payload: SignInPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signin", payload)
  return data
}

async function signup(payload: SignUpPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload)
  return data
}

async function googleLogin(credential: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/google", { credential })
  return data
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>("/auth/me")
  return data.user
}

export function useSignIn() {
  return useMutation({ mutationFn: signin })
}

export function useSignUp() {
  return useMutation({ mutationFn: signup })
}

export function useGoogleLogin() {
  return useMutation({ mutationFn: googleLogin })
}
