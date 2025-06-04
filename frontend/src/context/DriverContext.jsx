import React, { createContext, useState, useEffect } from 'react';
import { driverService } from '../services/driverService';

export const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create new driver
  const createDriver = async (driverData) => {
    try {
      const newDriver = await driverService.createDriver(driverData);
      setDrivers([...drivers, newDriver]);
      return newDriver;
    } catch (err) {
      throw err;
    }
  };

  // Update driver
  const updateDriver = async (driverId, updates) => {
    try {
      const updatedDriver = await driverService.updateDriver(driverId, updates);
      setDrivers(drivers.map(driver => 
        driver.id === driverId ? updatedDriver : driver
      ));
      return updatedDriver;
    } catch (err) {
      throw err;
    }
  };

  // Delete driver
  const deleteDriver = async (driverId) => {
    try {
      await driverService.deleteDriver(driverId);
      setDrivers(drivers.filter(driver => driver.id !== driverId));
    } catch (err) {
      throw err;
    }
  };

  // Assign vehicle to driver
  const assignVehicle = async (driverId, vehicleId) => {
    try {
      const updatedDriver = await driverService.assignVehicle(driverId, vehicleId);
      setDrivers(drivers.map(driver => 
        driver.id === driverId ? updatedDriver : driver
      ));
      return updatedDriver;
    } catch (err) {
      throw err;
    }
  };

  // Get driver stats
  const getDriverStats = async (driverId) => {
    try {
      return await driverService.getDriverStats(driverId);
    } catch (err) {
      throw err;
    }
  };

  // Fetch drivers from API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await driverService.getDrivers();
        setDrivers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const value = {
    drivers,
    loading,
    error,
    createDriver,
    updateDriver,
    deleteDriver,
    assignVehicle,
    getDriverStats
  };

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );

  return (
    <DriverContext.Provider 
      value={{
        drivers,
        loading,
        error,
        createDriver,
        updateDriver,
        deleteDriver
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export const useDriverContext = () => {
  const context = React.useContext(DriverContext);
  if (context === undefined) {
    throw new Error('useDriverContext debe ser usado dentro de un DriverProvider');
  }
  return context;
};
