import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const driverService = {
  // Obtener todos los conductores
  async getDrivers() {
    const response = await axios.get(`${API_URL}/drivers`);
    return response.data;
  },

  // Crear un nuevo conductor
  async createDriver(driverData) {
    const response = await axios.post(`${API_URL}/drivers`, driverData);
    return response.data;
  },

  // Actualizar un conductor existente
  async updateDriver(driverId, updates) {
    const response = await axios.put(`${API_URL}/drivers/${driverId}`, updates);
    return response.data;
  },

  // Eliminar un conductor
  async deleteDriver(driverId) {
    await axios.delete(`${API_URL}/drivers/${driverId}`);
  },

  // Asignar vehículo a conductor
  async assignVehicle(driverId, vehicleId) {
    const response = await axios.post(`${API_URL}/drivers/${driverId}/vehicle`, {
      vehicleId
    });
    return response.data;
  },

  // Enviar reporte
  async sendReport(driverId, reportData) {
    const response = await axios.post(`${API_URL}/drivers/${driverId}/reports`, reportData);
    return response.data;
  },

  // Obtener estadísticas del conductor
  async getDriverStats(driverId) {
    const response = await axios.get(`${API_URL}/drivers/${driverId}/stats`);
    return response.data;
  }
};
