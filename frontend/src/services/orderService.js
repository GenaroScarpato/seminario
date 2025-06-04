import { mockOrders } from '../data/mockData';

export const orderService = {
  // Obtener todos los pedidos
  async getOrders() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockOrders), 1000);
    });
  },

  // Crear un nuevo pedido
  async createOrder(orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder = {
          id: mockOrders.length + 1,
          ...orderData,
          created_at: new Date().toISOString(),
          status: 'pending'
        };
        mockOrders.push(newOrder);
        resolve(newOrder);
      }, 1000);
    });
  },

  // Actualizar un pedido existente
  async updateOrder(orderId, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          mockOrders[orderIndex] = { ...mockOrders[orderIndex], ...updates };
          resolve(mockOrders[orderIndex]);
        } else {
          throw new Error('Pedido no encontrado');
        }
      }, 1000);
    });
  },

  // Eliminar un pedido
  async deleteOrder(orderId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          mockOrders.splice(orderIndex, 1);
          resolve();
        } else {
          reject(new Error('Pedido no encontrado'));
        }
      }, 1000);
    });
  },

  // Geolocalizar dirección
  async geolocateAddress(address) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulación de geolocalización
        resolve({
          lat: -34.6037,
          lng: -58.3816,
          formatted_address: address
        });
      }, 1000);
    });
  },

  // Asignar pedido a vehículo
  async assignOrderToVehicle(orderId, vehicleId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          mockOrders[orderIndex] = {
            ...mockOrders[orderIndex],
            vehicle_id: vehicleId,
            status: 'assigned'
          };
          resolve(mockOrders[orderIndex]);
        } else {
          throw new Error('Pedido no encontrado');
        }
      }, 1000);
    });
  }
};
