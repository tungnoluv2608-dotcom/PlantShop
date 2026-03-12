import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminUser {
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface AdminState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const MOCK_ADMIN: AdminUser = {
  email: "admin@pap.vn",
  name: "Phạm Anh Tuấn",
  role: "Super Admin",
  avatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&auto=format&fit=crop&face",
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 800));
        if (email === "admin@pap.vn" && password === "admin123") {
          set({ user: MOCK_ADMIN, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "pap-admin-auth" }
  )
);
