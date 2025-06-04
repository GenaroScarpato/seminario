export const mockOrders = [
  {
    id: 1,
    address: 'Calle 123, Ciudad',
    volume: 1.5,
    priority: 'high',
    status: 'pending',
    delivery_date: '2025-06-03T14:30:00.000Z',
    notes: 'Entrega urgente',
    vehicle_id: 1,
    driver_id: 1,
    created_at: '2025-06-02T18:30:00.000Z'
  },
  {
    id: 2,
    address: 'Av. Principal 456',
    volume: 2.0,
    priority: 'normal',
    status: 'assigned',
    delivery_date: '2025-06-04T09:00:00.000Z',
    notes: 'Fragil',
    vehicle_id: 2,
    driver_id: 2,
    created_at: '2025-06-02T18:35:00.000Z'
  },
  {
    id: 3,
    address: 'Calle Secundaria 789',
    volume: 0.8,
    priority: 'low',
    status: 'delivered',
    delivery_date: '2025-06-02T15:00:00.000Z',
    notes: 'Sin comentarios',
    vehicle_id: 3,
    driver_id: 3,
    created_at: '2025-06-02T17:45:00.000Z'
  }
];

export const mockVehicles = [
  {
    id: 1,
    name: 'Vehículo 1',
    capacity: 3.0,
    status: 'available',
    type: 'van'
  },
  {
    id: 2,
    name: 'Vehículo 2',
    capacity: 5.0,
    status: 'in_use',
    type: 'truck'
  },
  {
    id: 3,
    name: 'Vehículo 3',
    capacity: 2.5,
    status: 'maintenance',
    type: 'van'
  }
];

export const mockDrivers = [
  {
    id: 1,
    name: 'Juan Pérez',
    status: 'active',
    vehicle_id: 1
  },
  {
    id: 2,
    name: 'María García',
    status: 'active',
    vehicle_id: 2
  },
  {
    id: 3,
    name: 'Carlos Rodríguez',
    status: 'inactive',
    vehicle_id: 3
  }
];
