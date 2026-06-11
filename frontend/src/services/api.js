import axios from "axios";

const api = axios.create({
  baseURL:
    (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach a lightweight dev user header from localStorage so backend optionalAuth
// can identify the current user without JWTs.
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("dev_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u._id) {
          config.headers = config.headers || {};
          config.headers["x-user-id"] = u._id;
        }
        if (u && u.email) {
          config.headers = config.headers || {};
          config.headers["x-user-email"] = u.email;
        }
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
