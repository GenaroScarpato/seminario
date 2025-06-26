import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL, API_ROUTES } from '@config/api';

export const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`);
        const data = await res.json();
        setVehicles(data);
      } catch (error) {
        console.error('Error cargando vehículos:', error);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <VehicleContext.Provider value={{ vehicles, setVehicles }}>
      {children}
    </VehicleContext.Provider>
  );
};
