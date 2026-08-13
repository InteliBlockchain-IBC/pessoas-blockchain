import axios from "axios";

export const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
  // O cookie de sessao e httpOnly: o browser o envia sozinho, desde que
  // withCredentials esteja ligado. Nao ha mais header de identidade.
  withCredentials: true,
});

// 401 = sem sessao. 403 = sessao valida, conta ainda nao aprovada.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined") {
      const status = err?.response?.status;
      if (status === 401 && window.location.pathname !== "/login") {
        window.location.href = "/login";
      } else if (status === 403 && window.location.pathname !== "/pendente") {
        window.location.href = "/pendente";
      }
    }
    return Promise.reject(err);
  },
);

/**
 * Download a file from the API using the authenticated axios instance.
 * `window.open()` abriria uma request sem os cookies de credencial.
 */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const response = await api.get(path, { responseType: "blob" });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
