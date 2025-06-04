import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_ROUTES } from '@/config/api';

import VehicleTable from '@/components/vehicles/VehicleTable';
import VehicleForm from '@/components/vehicles/VehicleForm';

const VehiclesAdmin = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      alert('Error al cargar los vehículos. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCreateVehicle = async (vehicleData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${API_ROUTES.VEHICULOS.CREATE}`, vehicleData);
      setVehicles([...vehicles, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      alert('Error al crear el vehículo. Por favor, verifica los datos e inténtalo de nuevo.');
    }
  };

  const handleUpdateVehicle = async (vehicleData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}${API_ROUTES.VEHICULOS.UPDATE.replace(':id', selectedVehicle.id)}`, vehicleData);
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === selectedVehicle.id ? response.data : vehicle
      ));
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      alert('Error al actualizar el vehículo. Por favor, verifica los datos e inténtalo de nuevo.');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;

    try {
      await axios.delete(`${API_BASE_URL}${API_ROUTES.VEHICULOS.DELETE.replace(':id', id)}`);
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
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
      <div className="row mb-4">
        <h2 className="col-12 mb-3">Gestión de Vehículos</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setSelectedVehicle(null);
            setShowModal(true);
          }}
        >
          Agregar Vehículo
        </button>
      </div>

      <VehicleTable
        vehicles={vehicles}
        onDelete={handleDeleteVehicle}
        onEdit={handleEditVehicle}
      />

      {/* Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} 
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
                onClick={() => {
                  setSelectedVehicle(null);
                  setShowModal(false);
                }}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <VehicleForm
                onSubmit={handleSubmit}
                vehicle={selectedVehicle}
              />
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedVehicle(null);
                  setShowModal(false);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`modal-backdrop fade ${showModal ? 'show' : ''}`} 
           style={{ display: showModal ? 'block' : 'none' }}
      ></div>
    </div>
  );
};

export default VehiclesAdmin;
