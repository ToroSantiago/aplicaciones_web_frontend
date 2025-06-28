// config/api.js

// URL base del backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/edp";

// Endpoints
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  GOOGLE_TOKEN: `${API_BASE_URL}/auth/google/token`,
  
  // Perfumes
  PERFUMES_ALL: `${API_BASE_URL}/all`,
  PERFUMES_PAGINATED: `${API_BASE_URL}/paginated`,
  PERFUMES_BY_GENERO: (genero) => `${API_BASE_URL}/genero/${genero}`,
  PERFUME_DETAIL: (id) => `${API_BASE_URL}/${id}`,
  
  // Usuarios
  USUARIOS: `${API_BASE_URL}/usuarios`,
  USUARIO_DETAIL: (id) => `${API_BASE_URL}/usuarios/${id}`,
};

// Configuración de Google
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Helper para hacer peticiones con el token
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};

export default API_BASE_URL;