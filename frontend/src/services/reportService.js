import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const reportService = {
  // Obtener estadísticas generales
  async getSystemStats() {
    const response = await axios.get(`${API_URL}/reports/stats`);
    return response.data;
  },

  // Obtener ranking de conductores
  async getDriverRanking() {
    const response = await axios.get(`${API_URL}/reports/drivers/ranking`);
    return response.data;
  },

  // Obtener eficiencia por vehículo
  async getVehicleEfficiency() {
    const response = await axios.get(`${API_URL}/reports/vehicles/efficiency`);
    return response.data;
  },

  // Obtener tiempos de entrega
  async getDeliveryTimes() {
    const response = await axios.get(`${API_URL}/reports/delivery-times`);
    return response.data;
  },

  // Obtener reportes de incidencias
  async getIncidentReports() {
    const response = await axios.get(`${API_URL}/reports/incidents`);
    return response.data;
  }
};
