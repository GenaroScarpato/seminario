import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL, API_ROUTES } from '@config/api';

export const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.CONDUCTORES.ALL}`);
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error cargando conductores:', error);
    }
  };

  // Fetch vehicles (asumo que tenés ruta API_ROUTES.VEHICulos.ALL)
  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`);
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  // Create driver
  const createDriver = async (driverData) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.CONDUCTORES.CREATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });
      if (!res.ok) throw new Error('Error al crear conductor');
      const newDriver = await res.json();
      setDrivers(prev => [...prev, newDriver]);
    } catch (error) {
      console.error(error);
    }
  };

  // Update driver
  const updateDriver = async (driverData) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.CONDUCTORES.UPDATE.replace(':id', driverData.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });
      if (!res.ok) throw new Error('Error al actualizar conductor');
      const updatedDriver = await res.json();
      setDrivers(prev => prev.map(d => (d.id === updatedDriver.id ? updatedDriver : d)));
    } catch (error) {
      console.error(error);
    }
  };

  // Delete driver
  const deleteDriver = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.CONDUCTORES.DELETE.replace(':id', id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar conductor');
      setDrivers(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DriverContext.Provider value={{
      drivers,
      vehicles,
      createDriver,
      updateDriver,
      deleteDriver,
    }}>
      {children}
    </DriverContext.Provider>
  );
};
