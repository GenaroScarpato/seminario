import styles from '../Dashboard.module.css';

const VehicleTable = ({ vehicles, onDelete, showActions = true, className }) => {
  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <table className={styles.enhancedTable}>
        <thead>
          <tr>
            <th>Patente</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Tipo</th>
            <th>Capacidad (kg)</th>
            <th>Estado</th>
            {showActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(vehicles) && vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.patente}</td>
                <td>{vehicle.marca}</td>
                <td>{vehicle.modelo}</td>
                <td>{vehicle.anio}</td>
                <td>{vehicle.tipo}</td>
                <td>{vehicle.capacidad}</td>
                <td>
                  <span className={`${styles.badge} ${vehicle.estado === 'disponible' ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {vehicle.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                  </span>
                </td>
                {showActions && (
                  <td>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => onDelete(vehicle.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showActions ? 8 : 7} className={styles.noData}>
                No hay vehículos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;