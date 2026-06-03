import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://backend:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = sessionStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });

  sessionStorage.setItem("access_token", data.access_token);
  if (data.refresh_token) {
    sessionStorage.setItem("refresh_token", data.refresh_token);
  }

  return data.access_token;
}

function forceLogout() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("is_superuser");
  window.location.replace("/login");
}

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;

        if (original.data instanceof FormData) {
          original.headers["Content-Type"] = "multipart/form-data";
        }

        return api(original);
      } catch (refreshError) {
        console.error("[api] Refresh token expired:", refreshError.message);
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;