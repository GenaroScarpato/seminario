import React from 'react';
import { useOrderContext } from '../../context/OrderContext';
import { useVehicleContext } from '../../context/VehicleContext';
import { useDriverContext } from '../../context/DriverContext';

const OrderTable = () => {
  const { orders, loading, error } = useOrderContext();
  const { vehicles } = useVehicleContext();
  const { drivers } = useDriverContext();

  // Obtener vehículo asignado por ID
  const getVehicle = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  // Obtener conductor asignado por ID
  const getDriver = (driverId) => {
    return drivers.find(d => d.id === driverId);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No hay pedidos registrados</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dirección</th>
            <th>Volumen</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Asignado a</th>
            <th>Fecha de Entrega</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.address}</td>
              <td>{order.volume} m³</td>
              <td>
                <span className={`badge bg-${
                  order.priority === 'high' ? 'danger' :
                  order.priority === 'normal' ? 'warning' :
                  'success'
                }`}>
                  {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                </span>
              </td>
              <td>
                <span className={`badge bg-${
                  order.status === 'pending' ? 'secondary' :
                  order.status === 'assigned' ? 'info' :
                  order.status === 'in_progress' ? 'warning' :
                  order.status === 'delivered' ? 'success' :
                  'danger'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </td>
              <td>
                {order.vehicle_id && (
                  <div>
                    <strong>Vehículo:</strong> {getVehicle(order.vehicle_id)?.name}
                    <br />
                    <strong>Conductor:</strong> {getDriver(order.driver_id)?.name}
                  </div>
                )}
              </td>
              <td>
                {new Date(order.delivery_date).toLocaleString()}
              </td>
              <td>
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      // Implementar edición
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      // Implementar eliminación
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};

export default OrderTable;
