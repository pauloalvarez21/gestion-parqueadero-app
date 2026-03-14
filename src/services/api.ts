import axios from 'axios';

const API_URL = 'http://192.168.1.25:8082';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = api.defaults.headers.common['Authorization'];
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar y redirigir a login
      api.defaults.headers.common['Authorization'] = null;
    }
    return Promise.reject(error);
  }
);

export default api;
