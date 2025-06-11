import React, { useState } from 'react';
import { FaFilter, FaChevronDown, FaChevronUp, FaSearch, FaCar, FaListUl } from 'react-icons/fa';

const DriverFilters = ({ 
  selectedEstado, 
  onEstadoChange,
  searchName,
  onSearchNameChange,
  vehicles,
  selectedVehicle,
  onVehicleChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="card shadow-sm">
      <div 
        className="card-header bg-white d-flex justify-content-between align-items-center py-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">
          <FaFilter className="me-2 text-primary" />
          <h6 className="mb-0">Filtros</h6>
        </div>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      
      {isExpanded && (
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm border-start-0"
                  value={searchName}
                  onChange={(e) => onSearchNameChange(e.target.value)}
                  placeholder="Buscar conductor..."
                />
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <FaListUl className="text-muted" />
                </span>
                <select
                  className="form-select form-select-sm"
                  value={selectedEstado}
                  onChange={(e) => onEstadoChange(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="disponible">Disponible</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <FaCar className="text-muted" />
                </span>
                <select
                  className="form-select form-select-sm"
                  value={selectedVehicle?.id || ''}
onChange={(e) => {
  const selectedId = parseInt(e.target.value);
  const foundVehicle = vehicles.find(v => v.id === selectedId);
  onVehicleChange(foundVehicle || null);
}}
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
        </div>
      )}
    </div>
  );
};

export default DriverFilters;
