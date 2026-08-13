import { api, getBaseUrl } from "./api";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

export const authService = {
  getGoogleAuthUrl: () => {
    return `${getBaseUrl()}/auth/google`;
  },

  /** Usuário autenticado, direto do banco. `null` se a sessão não resolver. */
  getMe: async (): Promise<CurrentUser | null> => {
    const response = await api.get("/auth/me");
    return response.data?.data ?? null;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("x-user-id");
      localStorage.removeItem("x-user-role");
    }
  },

  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("x-user-id");
    }
    return false;
  }
};
