import { create } from 'zustand';
import api from '../services/api';

interface AuthState {
  token: string | null;
  user: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });

      console.log('Datos recibidos del Login:', response.data);

      const token = response.data.token;
      // Asumiendo que el campo se llama 'role' o 'rol' en el JSON
      const role = response.data.role || response.data.rol || 'USER'; 
      
      // Configurar el token en los headers de axios globalmente
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({ 
        token, 
        user: username, 
        role,
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error al intentar hacer login:', error.isAxiosError ? error.toJSON() : error);
      set({ isLoading: false });
      throw error; // Re-lanzamos el error para que la UI muestre la alerta
    }
  },

  logout: () => {
    // Limpiar header y estado
    api.defaults.headers.common['Authorization'] = null;
    set({ token: null, user: null, role: null, isAuthenticated: false });
  },
}));
