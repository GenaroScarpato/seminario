import axios from 'axios';
import { getItem } from '../utils/storage';

const api = axios.create({
  baseURL: 'http://192.168.0.231:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Variable para almacenar la función de navegación (opcional, por si la necesitas en el futuro)
let globalNavigation;

// Variable para almacenar la función que obtiene el token del estado de Redux
let getTokenFromState = null;

// Función para configurar la navegación desde un componente
export const setApiNavigation = (navigation) => {
  globalNavigation = navigation;
};

// Función para inyectar el método que obtiene el token del estado
export const setTokenGetter = (tokenGetter) => {
  getTokenFromState = tokenGetter;
};

api.interceptors.request.use(
  async (config) => {
    try {
    
      
      let user = null;
      
      // PRIMERO: Intentar obtener el token del estado de Redux (si está disponible)
      if (getTokenFromState) {
        user = getTokenFromState();
      }
      
      // SEGUNDO: Si no hay token en Redux, intentar desde storage
      if (!user?.token) {
        user = await getItem('user');
      }
      
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
        
        // Verificar si el token está expirado
        if (user.exp && user.exp < Date.now() / 1000) {
        
        }
      } else {
      }
    } catch (error) {
      console.error('Error en interceptor:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;