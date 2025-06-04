import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const mapService = {
  // Geolocalizar dirección
  async geocodeAddress(address) {
    const response = await axios.get(`${API_URL}/maps/geocode`, {
      params: { address }
    });
    return response.data;
  },

  // Calcular ruta
  async calculateRoute(start, end, waypoints = []) {
    const response = await axios.post(`${API_URL}/maps/route`, {
      start,
      end,
      waypoints
    });
    return response.data;
  },

  // Obtener tráfico
  async getTraffic() {
    const response = await axios.get(`${API_URL}/maps/traffic`);
    return response.data;
  },

  // Obtener rutas optimizadas
  async getOptimizedRoutes(orders, vehicles) {
    const response = await axios.post(`${API_URL}/maps/optimize`, {
      orders,
      vehicles
    });
    return response.data;
  }
};
