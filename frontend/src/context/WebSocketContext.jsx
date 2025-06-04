import React, { createContext, useState, useEffect } from 'react';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [vehicleLocations, setVehicleLocations] = useState({});
  const [driverReports, setDriverReports] = useState([]);

  useEffect(() => {
    const initializeWebSocket = () => {
      const wsInstance = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:8080');
      
      wsInstance.onopen = () => {
        setConnected(true);
      };

      wsInstance.onclose = () => {
        setConnected(false);
        // Intentar reconectar después de 5 segundos
        setTimeout(initializeWebSocket, 5000);
      };

      wsInstance.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'VEHICLE_LOCATION':
            setVehicleLocations(prev => ({
              ...prev,
              [data.vehicleId]: data.location
            }));
            break;
          
          case 'DRIVER_REPORT':
            setDriverReports(prev => [
              data.report,
              ...prev.slice(0, 9) // Mantener solo los últimos 10 reportes
            ]);
            break;
        }
      };

      setWs(wsInstance);
    };

    initializeWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Enviar mensaje a WebSocket
  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider 
      value={{
        connected,
        vehicleLocations,
        driverReports,
        sendMessage
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
