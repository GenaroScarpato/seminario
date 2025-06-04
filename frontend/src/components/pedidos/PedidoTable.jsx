import React from 'react';

const PedidoTable = ({ pedidos, onDelete, onEdit }) => {
  return (
    <div className="container">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Volumen</th>
              <th>Asignado a</th>
              <th>Estado</th>
              <th>Programado para</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.address}</td>
                <td>{pedido.lat}</td>
                <td>{pedido.lng}</td>
                <td>{pedido.volume}</td>
                <td>{pedido.assigned_to}</td>
                <td>
                  <span className={`badge bg-${getStatusBadgeClass(pedido.status)}`}>
                    {getStatusText(pedido.status)}
                  </span>
                </td>
                <td>{new Date(pedido.scheduled_at).toLocaleString()}</td>
                <td>
                  <div className="btn-group">
                    <button 
                      className="btn btn-sm btn-primary me-1" 
                      onClick={() => onEdit(pedido)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => onDelete(pedido.id)}
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
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pendiente':
      return 'warning';
    case 'en_camino':
      return 'info';
    case 'entregado':
      return 'success';
    case 'cancelado':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'pendiente':
      return 'Pendiente';
    case 'en_camino':
      return 'En camino';
    case 'entregado':
      return 'Entregado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
};

export default PedidoTable;
