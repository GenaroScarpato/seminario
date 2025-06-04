import React, { createContext, useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';

export const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create new vehicle
  const createVehicle = async (vehicleData) => {
    try {
      const newVehicle = await vehicleService.createVehicle(vehicleData);
      setVehicles([...vehicles, newVehicle]);
      return newVehicle;
    } catch (err) {
      throw err;
    }
  };

  // Update vehicle
  const updateVehicle = async (vehicleId, updates) => {
    try {
      const updatedVehicle = await vehicleService.updateVehicle(vehicleId, updates);
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === vehicleId ? updatedVehicle : vehicle
      ));
      return updatedVehicle;
    } catch (err) {
      throw err;
    }
  };

  // Delete vehicle
  const deleteVehicle = async (vehicleId) => {
    try {
      await vehicleService.deleteVehicle(vehicleId);
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    } catch (err) {
      throw err;
    }
  };

  // Get optimized routes
  const getOptimizedRoutes = async (orders) => {
    try {
      return await vehicleService.getOptimizedRoutes(orders, vehicles);
    } catch (err) {
      throw err;
    }
  };

  // Update vehicle status
  const updateVehicleStatus = async (vehicleId, status) => {
    try {
      const updatedVehicle = await vehicleService.updateVehicleStatus(vehicleId, status);
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === vehicleId ? updatedVehicle : vehicle
      ));
      return updatedVehicle;
    } catch (err) {
      throw err;
    }
  };

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const value = {
    vehicles,
    loading,
    error,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getOptimizedRoutes,
    updateVehicleStatus
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicleContext = () => {
  const context = React.useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicleContext debe ser usado dentro de un VehicleProvider');
  }
  return context;
};
