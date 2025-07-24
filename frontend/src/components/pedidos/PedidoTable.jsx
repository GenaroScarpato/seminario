import styles from '../Dashboard.module.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const PedidoTable = ({ pedidos, onDelete, onEdit, showActions = true, className }) => {
  const pedidosValidos = Array.isArray(pedidos) ? pedidos : [];
const extraerDireccionCorta = (direccionCompleta) => {
  const partes = direccionCompleta.split(',');
  const tieneNumeroInicial = /^\d+/.test(partes[0].trim());
  let calleConNumero = '';
  let barrio = '';

  if (tieneNumeroInicial) {
    calleConNumero = `${partes[1].trim()} ${partes[0].trim()}`;
    barrio = partes[2]?.trim() || '';
  } else {
    const numeroEnParte1 = partes[1]?.match(/\d+/);
    if (numeroEnParte1) {
      calleConNumero = `${partes[0].trim()} ${numeroEnParte1[0]}`;
      barrio = partes[2]?.trim() || '';
    } else {
      calleConNumero = partes[0].trim();
      barrio = partes[2]?.trim() || '';
    }
  }

  return `${calleConNumero} - ${barrio}`;
};

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <table className={styles.enhancedTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dirección</th>
            <th>Volumen (m³)</th>
            <th>Peso (kg)</th>
            <th>Estado</th>
            <th>Programado para</th>
            {showActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {pedidosValidos.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 7 : 6} className={styles.noData}>
                No hay pedidos disponibles.
              </td>
            </tr>
          ) : (
            pedidosValidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{extraerDireccionCorta(pedido.direccion)}</td>
                <td>{pedido.volumen}</td>
                <td>{pedido.peso ?? '-'}</td>
                <td>
                  <span className={`${styles.badge} ${styles[getStatusBadgeClass(pedido.estado)]}`}>
                    {getStatusText(pedido.estado)}
                  </span>
                </td>
                <td>{pedido.scheduled_at ? new Date(pedido.scheduled_at).toLocaleString() : '-'}</td>
                {showActions && (
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editButton}
                        onClick={() => onEdit(pedido)}
                      >
                       <FaEdit className="me-1" /> Editar
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => onDelete(pedido.id)}
                      >
                       <FaTrash className="me-1" /> Eliminar
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pendiente': return 'badge-warning';
    case 'en_camino': return 'badge-info';
    case 'entregado': return 'badge-success';
    case 'cancelado': return 'badge-danger';
    default: return 'badge-secondary';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'en_camino': return 'En camino';
    case 'entregado': return 'Entregado';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
};

export default PedidoTable;