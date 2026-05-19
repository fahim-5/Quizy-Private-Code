import axios from "axios";

const api = axios.create({
  baseURL:
    (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach auth token from localStorage to each request if present
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
