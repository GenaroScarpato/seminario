import React from 'react';

const PedidoTable = ({ pedidos, onDelete, onEdit }) => {
  const pedidosValidos = Array.isArray(pedidos) ? pedidos : [];

  return (
    <div className="container">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Volumen (m³)</th>
              <th>Peso (kg)</th>
              <th>Estado</th>
              <th>Programado para</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosValidos.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No hay pedidos disponibles.
                </td>
              </tr>
            ) : (
              pedidosValidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.direccion}</td>
                  <td>{pedido.volumen}</td>
                  <td>{pedido.peso ?? '-'} </td>
                  <td>
                    <span className={`badge bg-${getStatusBadgeClass(pedido.status)}`}>
                      {getStatusText(pedido.status)}
                    </span>
                  </td>
                  <td>{pedido.scheduled_at ? new Date(pedido.scheduled_at).toLocaleString() : '-'}</td>
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
              ))
            )}
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
