const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
