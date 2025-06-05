import React from 'react';

const DriverFilters = ({ 
  selectedEstado, 
  onEstadoChange,
  searchName,
  onSearchNameChange,
  vehicles,
  selectedVehicle,
  onVehicleChange
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-3">Filtros</h5>
        
        <div className="mb-3">
          <label className="form-label">Buscar por nombre</label>
          <input
            type="text"
            className="form-control"
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            placeholder="Ingrese nombre o parte del nombre"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={selectedEstado}
            onChange={(e) => onEstadoChange(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Vehículo Asignado</label>
          <select
            className="form-select"
            value={selectedVehicle?.id || ''}
            onChange={(e) => onVehicleChange(vehicles.find(v => v.id === e.target.value) || null)}
          >
            <option value="">Todos los vehículos</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.patente} - {vehicle.marca} {vehicle.modelo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DriverFilters;
