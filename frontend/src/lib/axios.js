import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

// ─── Singleton promise untuk refresh ───────────────────────
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  return data.access_token;
}

function forceLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("is_superuser");
  
  // Menggunakan replace agar history login bersih
  window.location.replace("/login");
}

// ─── Request interceptor ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // Hanya handle 401, dan jangan retry endpoint refresh itu sendiri
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;

      try {
        // Handle singleton untuk mencegah tab ganda me-refresh bersamaan
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        // Pasang token baru ke header request original
        original.headers.Authorization = `Bearer ${newToken}`;
        
        // FIX UNTUK MULTIPART FORM DATA:
        // Jika request membawa FormData, beberapa browser memerlukan re-evaluation 
        // terhadap headers content-type agar boundary boundary-nya tidak rusak.
        if (original.data instanceof FormData) {
          original.headers["Content-Type"] = "multipart/form-data";
        }

        // Jalankan ulang request yang sempat tertunda
        return api(original);

      } catch (refreshError) {
        console.error("[api] Refresh token expired atau tidak valid:", refreshError.message);
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;