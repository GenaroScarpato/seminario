import store from '../store';
import { clearSession } from '../slices/authSlice';
import api from './api';

export const setupResponseInterceptor = () => {
  api.interceptors.response.use(
    response => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.log('Token expirado o inválido, cerrando sesión...');
        // Despachar la acción para limpiar la sesión
        await store.dispatch(clearSession());
        // No navegamos manualmente aquí, Redux se encargará automáticamente
      }
      return Promise.reject(error);
    }
  );
};