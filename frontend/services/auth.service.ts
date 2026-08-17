import { api, getBaseUrl } from "./api";

export const authService = {
  getGoogleAuthUrl: () => `${getBaseUrl()}/auth/google`,

  /** Revoga a sessao no servidor antes de sair. */
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      window.location.href = "/login";
    }
  },
};
