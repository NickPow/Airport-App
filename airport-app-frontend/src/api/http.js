
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 15000,
   headers: {
    "Content-Type": "application/json",
  },
});


http.interceptors.response.use(
  (res) => res,
  (err) => {
    
    if (err.response) {
      console.error("API error:", err.response.status, err.response.data);
    } else {
      console.error("Network error:", err.message);
    }
    return Promise.reject(err);
  }
);

export default http;
