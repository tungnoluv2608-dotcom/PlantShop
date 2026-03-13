import { api } from "./apiService";
import type { User } from "../types";

export const oauthApi = {
  // Verify Google credential (ID token from @react-oauth/google)
  googleLogin: async (credential: string): Promise<{ user: User; token: string }> => {
    const res = await api.post("/auth/google", { credential });
    return res.data;
  },

  // Verify Facebook access token
  facebookLogin: async (accessToken: string, userId: string): Promise<{ user: User; token: string }> => {
    const res = await api.post("/auth/facebook", { accessToken, userId });
    return res.data;
  },
};
