import React, { createContext, useState, useEffect } from 'react';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [center, setCenter] = useState({ lat: -34.6037, lng: -58.3816 }); // Coordenadas de Buenos Aires
  const [zoom, setZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trafficEnabled, setTrafficEnabled] = useState(false);

  // Actualizar marcadores
  const updateMarkers = (newMarkers) => {
    setMarkers(newMarkers);
  };

  // Actualizar rutas
  const updateRoutes = (newRoutes) => {
    setRoutes(newRoutes);
  };

  // Habilitar/deshabilitar tráfico
  const toggleTraffic = () => {
    setTrafficEnabled(!trafficEnabled);
  };

  return (
    <MapContext.Provider 
      value={{
        center,
        zoom,
        markers,
        routes,
        trafficEnabled,
        setCenter,
        setZoom,
        updateMarkers,
        updateRoutes,
        toggleTraffic
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
