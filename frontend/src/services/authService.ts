import axios from "axios";
import type { SignInData, SignUpData, User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

// Attach token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async signIn(data: SignInData): Promise<{ user: User; token: string }> {
    const res = await api.post("/auth/signin", data);
    return res.data;
  },

  async signUp(data: SignUpData): Promise<{ user: User; token: string }> {
    const res = await api.post("/auth/signup", data);
    return res.data;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem("token");
  },

  async getMe(): Promise<{ user: User }> {
    const res = await api.get("/auth/me");
    return res.data;
  },
};
