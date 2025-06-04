import React from 'react';


const VehicleTable = ({ vehicles, onDelete }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Patente</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(vehicles) ? vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.patente}</td>
              <td>{vehicle.marca}</td>
              <td>{vehicle.modelo}</td>
              <td>{vehicle.anio}</td>
              <td>{vehicle.tipo}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(vehicle.id)}>Eliminar</button>
              </td>
            </tr>
          )) : <tr><td colSpan="6">No hay vehículos disponibles</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
