import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminApi } from "../services/apiService";

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AdminState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const data = await adminApi.login(email, password);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "pap-admin-auth" }
  )
);
