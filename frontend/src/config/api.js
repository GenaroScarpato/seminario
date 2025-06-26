export const API_BASE_URL = 'http://localhost:3000'; // El backend está configurado para usar el puerto 3000

export const API_ROUTES = {
  VEHICULOS: {
    ALL: '/api/vehiculos',
    CREATE: '/api/vehiculos',
    UPDATE: '/api/vehiculos/:id',
    DELETE: '/api/vehiculos/:id'
  },
  PEDIDOS: {
    ALL: '/api/pedidos',
    CREATE: '/api/pedidos',
    UPDATE: '/api/pedidos/:id',
    DELETE: '/api/pedidos/:id'
  },
  CONDUCTORES: {
    ALL: '/api/conductores',
    CREATE: '/api/conductores',
    UPDATE: '/api/conductores/:id',
    DELETE: '/api/conductores/:id'
  }
};
