import { mockVehicles } from '../data/mockData';

export const vehicleService = {
  // Obtener todos los vehículos
  async getVehicles() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockVehicles), 1000);
    });
  },

  // Crear un nuevo vehículo
  async createVehicle(vehicleData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVehicle = {
          id: mockVehicles.length + 1,
          ...vehicleData,
          status: 'available'
        };
        mockVehicles.push(newVehicle);
        resolve(newVehicle);
      }, 1000);
    });
  },

  // Actualizar un vehículo existente
  async updateVehicle(vehicleId, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vehicleIndex = mockVehicles.findIndex(v => v.id === vehicleId);
        if (vehicleIndex !== -1) {
          mockVehicles[vehicleIndex] = { ...mockVehicles[vehicleIndex], ...updates };
          resolve(mockVehicles[vehicleIndex]);
        } else {
          throw new Error('Vehículo no encontrado');
        }
      }, 1000);
    });
  },

  // Eliminar un vehículo
  async deleteVehicle(vehicleId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vehicleIndex = mockVehicles.findIndex(v => v.id === vehicleId);
        if (vehicleIndex !== -1) {
          mockVehicles.splice(vehicleIndex, 1);
          resolve();
        } else {
          reject(new Error('Vehículo no encontrado'));
        }
      }, 1000);
    });
  },

  // Obtener rutas optimizadas
  async getOptimizedRoutes(orders, vehicles) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulación de rutas optimizadas
        const routes = orders.map(order => ({
          order_id: order.id,
          vehicle_id: vehicles[0].id,
          estimated_time: Math.floor(Math.random() * 60) + 30, // 30-90 minutos
          distance: Math.floor(Math.random() * 20) + 5 // 5-25 km
        }));
        resolve(routes);
      }, 1000);
    });
  },

  // Actualizar estado del vehículo
  async updateVehicleStatus(vehicleId, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vehicleIndex = mockVehicles.findIndex(v => v.id === vehicleId);
        if (vehicleIndex !== -1) {
          mockVehicles[vehicleIndex].status = status;
          resolve(mockVehicles[vehicleIndex]);
        } else {
          throw new Error('Vehículo no encontrado');
        }
      }, 1000);
    });
    return response.data;
  }
};
