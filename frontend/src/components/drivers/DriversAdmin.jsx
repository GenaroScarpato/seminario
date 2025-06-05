import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ROUTES } from '../../config/api';
import DriverForm from './DriverForm';
import DriverFilters from './DriverFilters';
import DriverHistory from './DriverHistory';
import DriverDocuments from './DriverDocuments';

const DriversAdmin = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [searchName, setSearchName] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.ALL}`);
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
      alert('Error al cargar los conductores. Por favor, inténtalo de nuevo.');
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const handleCreateDriver = async (driverData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });
      const data = await response.json();
      setDrivers([...drivers, data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error al crear conductor:', error);
      alert('Error al crear el conductor. Por favor, verifica los datos e inténtalo de nuevo.');
    }
  };

  const handleUpdateDriver = async (driverData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.UPDATE.replace(':id', driverData.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });
      const data = await response.json();
      setDrivers(drivers.map(driver => driver.id === driverData.id ? data : driver));
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar conductor:', error);
      alert('Error al actualizar el conductor. Por favor, verifica los datos e inténtalo de nuevo.');
    }
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este conductor?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.DELETE.replace(':id', id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDrivers(drivers.filter(driver => driver.id !== id));
      } else {
        throw new Error('Error al eliminar conductor');
      }
    } catch (error) {
      console.error('Error al eliminar conductor:', error);
      alert('Error al eliminar el conductor. Por favor, inténtalo de nuevo.');
    }
  };

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
      handleUpdateDriver(formData);
    } else {
      handleCreateDriver(formData);
    }
  };

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    const matchesName = driver.nombre.toLowerCase().includes(searchName.toLowerCase());
    const matchesEstado = selectedEstado === 'todos' || driver.estado === selectedEstado;
    const matchesVehicle = !selectedVehicle || driver.vehiculo_asignado === selectedVehicle.id;
    return matchesName && matchesEstado && matchesVehicle;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <h2>Administración de Conductores</h2>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          Nuevo Conductor
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
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
              <th>Email</th>
              <th>Estado</th>
              <th>Vehículo Asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.nombre}</td>
                <td>{driver.dni}</td>
                <td>{driver.telefono}</td>
                <td>{driver.email}</td>
                <td>
                  <select
                    value={driver.estado}
                    onChange={(e) => handleUpdateDriver({ ...driver, estado: e.target.value })}
                    className="form-select form-select-sm"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </td>
                <td>
                  {driver.vehiculo_asignado ? 
                    vehicles.find(v => v.id === driver.vehiculo_asignado)?.patente : 'Sin vehículo'}
                </td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm me-1"
                    onClick={() => handleOpenModal(driver)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-info btn-sm me-1"
                    onClick={() => handleViewHistory(driver.id)}
                  >
                    Historial
                  </button>
                  <button 
                    className="btn btn-success btn-sm me-1"
                    onClick={() => handleViewDocuments(driver.id)}
                  >
                    Documentos
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteDriver(driver.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} 
           style={{ display: showModal ? 'block' : 'none' }}
           tabIndex="-1"
           role="dialog"
           aria-labelledby="driverModalLabel"
           aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="driverModalLabel">
                {selectedDriver ? 'Editar' : 'Nuevo'} Conductor
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleCloseModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <DriverForm
                onSubmit={handleSubmit}
                driver={selectedDriver}
                vehicles={vehicles}
              />
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCloseModal}
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

export default DriversAdmin;
