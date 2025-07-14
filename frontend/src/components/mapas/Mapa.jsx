import React, { useContext, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { io } from 'socket.io-client';

import { OrderContext } from '../../context/OrderContext.jsx';
import { MapContext } from '../../context/MapContext.jsx';
import { VehicleContext } from '../../context/VehicleContext.jsx';
import { DriverContext } from '../../context/DriverContext.jsx';

// Base position for the map center and starting point
const basePosition = [-34.58402190, -58.46702480];
const baseLngLat = `${basePosition[1]},${basePosition[0]}`;

// Custom icons for order statuses
const iconPendiente = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png', iconSize: [30, 30] });
const iconEntregado = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', iconSize: [30, 30] });
const iconCancelado = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png', iconSize: [30, 30] });

const iconEnCamino = new L.Icon({
  iconUrl: '/image.png', // Ruta relativa a tu archivo image.png en la carpeta public
  iconSize: [30, 30] // Puedes ajustar el tamaño según tus necesidades
});


const getIconByEstado = (estado) => {
  switch (estado) {
    case 'pendiente': return iconPendiente;
    case 'entregado': return iconEntregado;
    case 'cancelado': return iconCancelado;
    case 'en_camino': return iconEnCamino;
    default: return iconPendiente;
  }
};

// Custom icon for the driver's location
const iconConductor = new L.Icon({
  iconUrl: 'https://static.thenounproject.com/png/car-top-view-icon-7680677-512.png',
  iconSize: [45, 45],
});

const Mapa = () => {
  // Accessing context values
  const { orders } = useContext(OrderContext);
  const { mapState } = useContext(MapContext);
  const { vehicles } = useContext(VehicleContext);
  const { drivers } = useContext(DriverContext);

  // State for optimized routes, driver locations, and socket errors
  const [rutasOptimizadas, setRutasOptimizadas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [socketError, setSocketError] = useState(null);
  const socketRef = useRef(null); // Ref to hold the socket instance

  const assignments = mapState.assignments;

  // Filter and format valid orders with numeric lat/lng
  const validOrders = orders
    .map(p => {
      const lat = Number(p.lat), lng = Number(p.lng);
      if (isNaN(lat) || isNaN(lng)) return null;
      return { ...p, position: [lat, lng] };
    })
    .filter(p => p);

  // Effect to fetch optimized routes based on assignments
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!assignments) return; // Do nothing if no assignments
      const rutas = [];

      // Iterate through each vehicle's assignments
      for (const [vehiculoId, pedidoIds] of Object.entries(assignments)) {
        // Find orders corresponding to the assigned IDs
        const pedidos = pedidoIds.map(id => validOrders.find(p => p.id === id)).filter(Boolean);
        // Create an array of points for the OSRM API, starting with the base position
        const puntos = [baseLngLat, ...pedidos.map(p => `${p.lng},${p.lat}`)];
        if (puntos.length < 2) continue; // Need at least two points for a route

        try {
          // Fetch route from OSRM
          const res = await axios.get(`http://router.project-osrm.org/route/v1/driving/${puntos.join(';')}?overview=full&geometries=geojson`);
          const route = res.data.routes[0];
          // Convert GeoJSON coordinates to Leaflet [lat, lng] format
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

          // Add the optimized route data to the array
          rutas.push({ 
            vehiculoId, 
            ruta: coords, 
            duracion: route.duration,
            distancia: route.distance   
          });
        } catch (err) {
          console.error(`Error fetching route for vehicle ${vehiculoId}:`, err);
        }
      }

      setRutasOptimizadas(rutas); // Update state with optimized routes
    };

    fetchRoutes();
  }, [assignments, orders]); // Re-run when assignments or orders change

  // Effect to manage WebSocket connection for real-time driver locations
  useEffect(() => {
    // Determine the socket URL from environment variables or default to localhost
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    console.log('Attempting to connect to socket at:', socketUrl);

    // Initialize socket connection
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'], // Preferred transports
      reconnection: true, // Enable auto-reconnection
      reconnectionAttempts: 5, // Number of reconnection attempts
      reconnectionDelay: 1000, // Delay between reconnection attempts
      timeout: 20000, // Connection timeout
    });

    const socket = socketRef.current;

    // Socket event listener for 'connect'
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      setSocketError(null); // Clear any previous socket errors
    });

    // Socket event listener for 'connect_error'
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setSocketError(`Connection error: ${err.message}`); // Set socket error message
    });

    // Socket event listener for 'ubicacion_conductor' (driver location updates)
    socket.on('ubicacion_conductor', (data) => {
      console.log('Received driver location:', data);
      // Validate received data
      if (!data || isNaN(data.lat) || isNaN(data.lng)) {
        console.error('Invalid location data received:', data);
        return;
      }

      // Update ubicaciones state: remove old entry for the same driver and add the new one
      setUbicaciones(prev => {
        const otrasUbicaciones = prev.filter(u => u.dni !== data.dni);
        return [...otrasUbicaciones, {
          dni: data.dni,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          timestamp: data.timestamp || new Date().toISOString() // Use provided timestamp or current time
        }];
      });
    });

    // Socket event listener for 'disconnect'
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Cleanup function for the effect: disconnect the socket when component unmounts
    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <div style={{ width: '100%' }}>
      {/* Display socket error message if any */}
      {socketError && (
        <div className="alert alert-warning">
          {socketError} - Real-time locations are not available.
        </div>
      )}

      {/* Map container */}
      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer 
          center={basePosition} 
          zoom={13} 
          scrollWheelZoom 
          style={{ height: '100%', width: '100%' }}
        >
          {/* OpenStreetMap Tile Layer */}
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='© OpenStreetMap contributors' 
          />

          {/* Marker for the base position */}
          <Marker position={basePosition}>
            <Popup>🚩 Starting Point: Base Triunvirato y Tronador</Popup>
          </Marker>

          {/* Markers for valid orders */}
          {validOrders.map(p => (
            <Marker key={p.id} position={p.position} icon={getIconByEstado(p.estado)}>
              <Popup>
                <b>{p.cliente || 'Unknown Client'}</b><br />
                {p.direccion}<br />
                Status: <b>{p.estado}</b>
              </Popup>
            </Marker>
          ))}

          {/* Markers for real-time driver locations */}
          {ubicaciones.map((ubicacion) => (
            <Marker
              key={`${ubicacion.dni}-${ubicacion.timestamp}`} // Unique key for each location update
              position={[ubicacion.lat, ubicacion.lng]}
              icon={iconConductor}
            >
              <Popup>
                <b>🚗 Driver: {ubicacion.dni}</b><br />
                Last Update: {new Date(ubicacion.timestamp).toLocaleTimeString()}
              </Popup>
            </Marker>
          ))}

          {/* Polylines for optimized routes */}
          {rutasOptimizadas.map(({ vehiculoId, ruta }, idx) => {
            const colors = ['blue', 'green', 'red', 'orange', 'purple', 'brown', 'black'];
            return (
              <Polyline 
                key={vehiculoId} 
                positions={ruta} 
                pathOptions={{ 
                  color: colors[idx % colors.length], // Cycle through colors for different routes
                  weight: 5 
                }} 
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Summary of assignments */}
      <div className="mt-4 px-3">
        <h3>Assignment Summary</h3>
        {assignments ? Object.entries(assignments).map(([vehiculoId, pedidoIds]) => {
          const vehiculo = vehicles.find(v => v.id === +vehiculoId);
          const conductor = drivers.find(d => d.vehiculo_id === +vehiculoId);
          const pedidos = pedidoIds.map(id => validOrders.find(p => p.id === id)).filter(Boolean);
          const rutaData = rutasOptimizadas.find(r => r.vehiculoId === vehiculoId);

          return (
            <div key={vehiculoId} className="card mb-4 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>🚗 Vehicle #{vehiculoId}</h5>
                  <span className="badge bg-primary">{pedidoIds.length} orders</span>
                </div>
                <p>Type: {vehiculo?.tipo || 'N/A'} | License Plate: {vehiculo?.patente || 'N/A'}</p>
                <p>👨‍💼 Driver: {conductor ? `${conductor.nombre} ${conductor.apellido}` : 'Unassigned'}</p>
                {rutaData && (
                  <>
                    <p>⏱️ Total ETA: {Math.round(rutaData.duracion / 60)} min</p>
                    <p>📏 Distance: {(rutaData.distancia / 1000).toFixed(2)} km</p>
                  </>
                )}
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">🚩 Starting Point: Base Triunvirato y Tronador</li>
                  {pedidos.map(p => (
                    <li key={p.id} className="list-group-item">
                      📦 Order #{p.id} – {p.direccion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }) : <p>No active assignments.</p>}
      </div>
    </div>
  );
};

export default Mapa;
