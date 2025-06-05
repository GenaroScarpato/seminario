import React from 'react';

const VehicleFilters = ({ selectedEstado, onEstadoChange }) => {
  const handleEstadoChange = (estado) => {
    onEstadoChange(estado);
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="dropdown">
        <button 
          className="btn btn-link text-decoration-none text-secondary dropdown-toggle"
          type="button" 
          id="filtroDropdown" 
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {selectedEstado === 'todos' ? 'Todos' : selectedEstado.replace('_', ' ').replace('_', ' ').charAt(0).toUpperCase() + selectedEstado.slice(1)}
        </button>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="filtroDropdown">
          <li>
            <a className="dropdown-item" href="#" onClick={(e) => {
              e.preventDefault();
              handleEstadoChange('todos');
            }}>Todos</a>
          </li>
          <li>
            <a className="dropdown-item" href="#" onClick={(e) => {
              e.preventDefault();
              handleEstadoChange('disponible');
            }}>Disponible</a>
          </li>
          <li>
            <a className="dropdown-item" href="#" onClick={(e) => {
              e.preventDefault();
              handleEstadoChange('en_servicio');
            }}>En servicio</a>
          </li>
          <li>
            <a className="dropdown-item" href="#" onClick={(e) => {
              e.preventDefault();
              handleEstadoChange('mantenimiento');
            }}>Mantenimiento</a>
          </li>
          <li>
            <a className="dropdown-item" href="#" onClick={(e) => {
              e.preventDefault();
              handleEstadoChange('inactivo');
            }}>Inactivos</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VehicleFilters;
