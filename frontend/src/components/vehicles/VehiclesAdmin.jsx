import React, { useState, useEffect, useContext } from 'react';
import { VehicleContext } from '../../context/VehicleContext';
import { API_BASE_URL, API_ROUTES } from '../../config/api';

import VehicleForm from './VehicleForm';
import VehicleFilters from './VehicleFilters';

const VehiclesAdmin = ({ showActions = true }) => {  // Añadimos la prop showActions
  const { vehicles, setVehicles } = useContext(VehicleContext);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState('todos');

  useEffect(() => {
    if (selectedEstado === 'todos') {
      setFilteredVehicles(vehicles);
    } else {
      setFilteredVehicles(vehicles.filter(v => v.estado === selectedEstado));
    }
  }, [vehicles, selectedEstado]);

  const handleCreateVehicle = async (vehicleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.VEHICULOS.CREATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });
      const data = await response.json();
      setVehicles([...vehicles, data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      alert('Error al crear el vehículo. Por favor, verifica los datos e inténtalo de nuevo.');
    }
  };

  const handleUpdateVehicleStatus = async (id, nuevoEstado) => {
    try {
      const vehicleToUpdate = vehicles.find(v => v.id === id);
      if (!vehicleToUpdate) throw new Error('Vehículo no encontrado');

      const updatedVehicle = { ...vehicleToUpdate, estado: nuevoEstado };

      setVehicles(vehicles.map(v => (v.id === id ? updatedVehicle : v)));

      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.VEHICULOS.UPDATE.replace(':id', encodeURIComponent(id))}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedVehicle),
        }
      );

      if (!response.ok) {
        setVehicles(vehicles); // Revertir si falla
        throw new Error('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado. Por favor, inténtalo de nuevo.');
    }
  };

  const handleUpdateVehicle = async (vehicleData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.VEHICULOS.UPDATE.replace(':id', selectedVehicle.id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        }
      );
      const data = await response.json();
      setVehicles(vehicles.map(v => (v.id === selectedVehicle.id ? data : v)));
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      alert('Error al actualizar el vehículo. Por favor, verifica los datos e inténtalo de nuevo.');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.VEHICULOS.DELETE.replace(':id', id)}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setVehicles(vehicles.filter(v => v.id !== id));
      } else {
        throw new Error('Error al eliminar el vehículo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el vehículo. Por favor, inténtalo de nuevo.');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleOpenNew = () => {
    setSelectedVehicle(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedVehicle(null);
    setShowModal(false);
  };

  const handleSubmit = (data) => {
    if (selectedVehicle) {
      handleUpdateVehicle(data);
    } else {
      handleCreateVehicle(data);
    }
  };

 return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de Vehículos</h2>
        {showActions && (  // Solo muestra el botón si showActions es true
          <button className="btn btn-primary" onClick={handleOpenNew}>
            Nuevo Vehículo
          </button>
        )}
      </div>

      <div className="mb-3">
        <VehicleFilters
          selectedEstado={selectedEstado}
          onEstadoChange={setSelectedEstado}
        />
      </div>

      <table className="table table-striped table-bordered table-hover">
        <thead>
          <tr>
            <th>Patente</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Tipo</th>
            <th>Capacidad</th>
            <th>Estado</th>
            {showActions && <th>Acciones</th>}  {/* Columna condicional */}
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No hay vehículos disponibles
              </td>
            </tr>
          ) : (
            filteredVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.patente}</td>
                <td>{vehicle.marca}</td>
                <td>{vehicle.modelo}</td>
                <td>{vehicle.anio}</td>
                <td>{vehicle.tipo}</td>
                <td>{vehicle.capacidad}</td>
                <td>
                  <select
                    value={vehicle.estado}
                    onChange={e => handleUpdateVehicleStatus(vehicle.id, e.target.value)}
                    className="form-select form-select-sm"
                    style={{ maxWidth: '150px' }}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="en_servicio">En servicio</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    Eliminar
                  </button>{' '}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditVehicle(vehicle)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      <div
        className={`modal fade ${showModal ? 'show' : ''}`}
        style={{ display: showModal ? 'block' : 'none' }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="vehicleModalLabel"
        aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="vehicleModalLabel">
                {selectedVehicle ? 'Editar' : 'Nuevo'} Vehículo
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <VehicleForm onSubmit={handleSubmit} vehicle={selectedVehicle} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`modal-backdrop fade ${showModal ? 'show' : ''}`}
        style={{ display: showModal ? 'block' : 'none' }}
      ></div>
    </div>
  );
};

export default VehiclesAdmin;
