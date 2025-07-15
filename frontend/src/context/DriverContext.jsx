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

  // Fetch vehicles
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

  // Crear conductor
  const createDriver = async (driverData) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.CONDUCTORES.CREATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });
      if (!res.ok) throw new Error('Error al crear conductor');
      await fetchDrivers(); // Refrescar lista
    } catch (error) {
      console.error(error);
    }
  };

  // Actualizar conductor
  const updateDriver = async (driverData) => {
    try {
      if (!driverData.id) throw new Error('Falta ID del conductor');
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.CONDUCTORES.UPDATE.replace(':id', driverData.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });
      if (!res.ok) throw new Error('Error al actualizar conductor');
      await fetchDrivers(); // Refrescar lista
    } catch (error) {
      console.error(error);
    }
  };

  // Eliminar conductor
  const deleteDriver = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.CONDUCTORES.DELETE.replace(':id', id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar conductor');
      await fetchDrivers(); // Refrescar lista
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
      fetchDrivers, // por si querés refrescar manualmente desde otro lado
      fetchVehicles,
    }}>
      {children}
    </DriverContext.Provider>
  );
};
