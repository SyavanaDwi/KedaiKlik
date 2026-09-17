import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Interceptor Request: Otomatis sisipkan Bearer Token setiap kali API dipanggil
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor Response: Tangani token kadaluarsa secara otomatis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus token jika unauthorized/expired lalu lempar ke login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
