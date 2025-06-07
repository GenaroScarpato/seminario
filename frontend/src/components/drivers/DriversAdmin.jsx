import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ROUTES } from '@config/api';
import { Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import DriverForm from './DriverForm';
import DriverFilters from './DriverFilters';
import DriverHistory from './DriverHistory';
import DriverDocuments from './DriverDocuments';

const DriversAdmin = () => {
  const navigate = useNavigate();
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
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.ALL}`, {
        credentials: 'include' // Incluir credenciales para manejar sesiones
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `Error al cargar los conductores: ${response.status} ${response.statusText}`
        );
      }
      
      const result = await response.json();
      
      // Asegurarse de que data sea un array
      const driversData = Array.isArray(result) ? result : (Array.isArray(result.data) ? result.data : []);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
      alert(error.message || 'Error al cargar los conductores. Por favor, inténtalo de nuevo.');
      setDrivers([]); // Asegurar que drivers sea un array vacío en caso de error
    }
  };

  const fetchVehicles = async () => {
    try {
      console.log('Solicitando vehículos a:', `${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`);
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`, {
        credentials: 'include' // Incluir credenciales para manejar sesiones
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `Error al cargar los vehículos: ${response.status} ${response.statusText}`
        );
      }
      
      const result = await response.json();
      const vehiclesData = Array.isArray(result) ? result : [];
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      // No mostramos alerta para no molestar con errores secundarios
      setVehicles([]);
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
    const driverName = driver.nombre || '';
    const driverEstado = driver.estado || '';
    const driverVehiculoId = driver.vehiculo_asignado || '';
    
    const matchesName = driverName.toString().toLowerCase().includes(searchName.toLowerCase());
    const matchesEstado = selectedEstado === 'todos' || driverEstado === selectedEstado;
    const matchesVehicle = !selectedVehicle || driverVehiculoId === selectedVehicle.id;
    
    return matchesName && matchesEstado && matchesVehicle;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <h2>Administración de Conductores</h2>
        </div>
        <Button 
          variant="primary" 
          onClick={() => handleOpenModal()}
        >
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
              <th>Email</th>
              <th>Estado</th>
              <th>Vehículo Asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredDrivers) && filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => {
                if (!driver || !driver.id) return null; // Saltar conductores inválidos
                
                const vehicleInfo = driver.vehiculo_asignado 
                  ? vehicles.find(v => v && v.id === driver.vehiculo_asignado)?.patente 
                  : 'Sin vehículo';
                
                return (
                  <tr key={`driver-${driver.id}`}>
                    <td>{driver.nombre || 'N/A'}</td>
                    <td>{driver.dni || 'N/A'}</td>
                    <td>{driver.telefono || 'N/A'}</td>
                    <td>{driver.email || 'N/A'}</td>
                    <td>
                      <select
                        value={driver.estado || 'activo'}
                        onChange={(e) => handleUpdateDriver({ ...driver, estado: e.target.value })}
                        className="form-select form-select-sm"
                        aria-label="Estado del conductor"
                      >
                        <option value="activo">Activo</option>
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
                          aria-label={`Editar ${driver.nombre || 'conductor'}`}
                        >
                          Editar
                        </button>
                        <button 
                          type="button"
                          className="btn btn-info btn-sm me-1"
                          onClick={() => handleViewHistory(driver.id)}
                          aria-label={`Ver historial de ${driver.nombre || 'conductor'}`}
                        >
                          Historial
                        </button>
                        <button 
                          type="button"
                          className="btn btn-success btn-sm me-1"
                          onClick={() => handleViewDocuments(driver.id)}
                          aria-label={`Ver documentos de ${driver.nombre || 'conductor'}`}
                        >
                          Documentos
                        </button>
                        <button 
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteDriver(driver.id)}
                          aria-label={`Eliminar ${driver.nombre || 'conductor'}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No se encontraron conductores
                </td>
              </tr>
            )}
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
