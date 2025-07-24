import React, { useState, useContext } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DriverForm from './DriverForm';
import DriverFilters from './DriverFilters';
import { DriverContext } from '../../context/DriverContext';
import { VehicleContext } from '../../context/VehicleContext';
import styles from '../Dashboard.module.css';

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
    <div className={`${styles.dashboardContainer} ${styles.section}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de Conductores</h2>
        <button
          className={styles.assignButton}
          onClick={() => handleOpenModal()}
        >
          <FaPlus className="me-2" /> Nuevo Conductor
        </button>
      </div>

      <div className="mb-3">
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

      <div className={styles.tableContainer}>
        <table className={styles.enhancedTable}>
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
                      className={styles.statusSelect}
                    >
                      <option value="disponible">Disponible</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </td>
                  <td>{vehicleInfo}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleOpenModal(driver)}
                      >
                        <FaEdit className="me-1" /> Editar
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteDriver(driver.id)}
                      >
                        <FaTrash className="me-1" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className={styles.noData}>No se encontraron conductores</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{selectedDriver ? 'Editar' : 'Nuevo'} Conductor</h3>
              <button
                className={styles.modalCloseButton}
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <DriverForm 
                onSubmit={handleSubmit} 
                driver={selectedDriver} 
                vehicles={vehicles} 
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.secondaryButton}
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => document.getElementById('driver-form').requestSubmit()}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversAdmin;