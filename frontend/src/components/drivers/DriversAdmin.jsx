import React, { useState, useContext } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import DriverForm from './DriverForm';
import DriverFilters from './DriverFilters';
import { DriverContext } from '../../context/DriverContext';
import { VehicleContext } from '../../context/VehicleContext'; 

const DriversAdmin = () => {
  const {
    drivers,
    createDriver,
    updateDriver,
    deleteDriver,
  } = useContext(DriverContext);
    const { vehicles } = useContext(VehicleContext); 

  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [searchName, setSearchName] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleOpenModal = (driver = null) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedDriver(null);
    setShowModal(false);
  };

  const handleSubmit = (formData) => {
    if (selectedDriver) {
      updateDriver(formData);
    } else {
      createDriver(formData);
    }
    handleCloseModal();
  };

  const handleDeleteDriver = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este conductor?')) {
      deleteDriver(id);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const driverName = driver.nombre || '';
    const driverEstado = driver.estado || '';
    const driverVehiculoId = driver.vehiculo_id || '';

    const matchesName = driverName.toLowerCase().includes(searchName.toLowerCase());
    const matchesEstado = selectedEstado === 'todos' || driverEstado === selectedEstado;
    const matchesVehicle = !selectedVehicle || driverVehiculoId === selectedVehicle.id;

    return matchesName && matchesEstado && matchesVehicle;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de Conductores</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" /> Nuevo Conductor
        </Button>
      </div>

      <div className="row mb-3">
        <div className="col-12">
          <DriverFilters
            selectedEstado={selectedEstado}
            onEstadoChange={setSelectedEstado}
            searchName={searchName}
            onSearchNameChange={setSearchName}
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onVehicleChange={setSelectedVehicle}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Vehículo Asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length > 0 ? filteredDrivers.map(driver => {
              if (!driver || !driver.id) return null;

              const vehicleInfo = driver.vehiculo_patente || 'Sin vehículo';

              return (
                <tr key={driver.id}>
                  <td>{driver.nombre || 'N/A'}</td>
                  <td>{driver.dni || 'N/A'}</td>
                  <td>{driver.telefono || 'N/A'}</td>
                  <td>
                    <select
                      value={driver.estado || 'disponible'}
                      onChange={e => updateDriver({ ...driver, estado: e.target.value })}
                      className="form-select form-select-sm"
                      aria-label="Estado del conductor"
                     >
                      <option value="disponible">Disponible</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </td>
                  <td>{vehicleInfo}</td>
                  <td>
                    <div className="btn-group" role="group" aria-label="Acciones del conductor">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm me-1"
                        onClick={() => handleOpenModal(driver)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteDriver(driver.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="text-center">No se encontraron conductores</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal con react-bootstrap */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" backdrop="static" keyboard={false}>
  <Modal.Header closeButton>
    <Modal.Title>{selectedDriver ? 'Editar' : 'Nuevo'} Conductor</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <DriverForm 
      onSubmit={handleSubmit} 
      driver={selectedDriver} 
      vehicles={vehicles} 
    />
  </Modal.Body>
</Modal>

    </div>
  );
};

export default DriversAdmin;
