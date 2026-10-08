import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response Interceptor for uniform data extraction
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorPayload = error.response?.data || {
      success: false,
      message: error.message || 'An unexpected network error occurred'
    };
    return Promise.reject(errorPayload);
  }
);

export default api;
