import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

// ─── Singleton promise untuk refresh ───────────────────────
// Mencegah race condition: refresh hanya dipanggil sekali,
// semua request yang antre pakai hasil promise yang sama.
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  // Pakai axios langsung (bukan instance api) agar tidak
  // masuk interceptor lagi dan menyebabkan infinite loop
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
  // Pakai replace agar halaman login tidak masuk history browser
  window.location.replace("/login");
}

// ─── Request interceptor ───────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // Hanya handle 401, dan jangan retry endpoint refresh itu sendiri
    // agar tidak infinite loop kalau refresh token juga expired
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;

      try {
        // Kalau refresh sedang berjalan, tunggu hasilnya —
        // jangan buat request refresh baru (fix race condition)
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);

      } catch (refreshError) {
        // Refresh token juga expired atau tidak valid
        console.error("[api] Refresh token expired:", refreshError.message);
        forceLogout();
        // Tolak dengan error asli agar caller bisa handle jika perlu
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;