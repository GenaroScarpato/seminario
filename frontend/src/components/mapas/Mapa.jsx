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

const basePosition = [-34.58402190, -58.46702480];
const baseLngLat = `${basePosition[1]},${basePosition[0]}`;

const iconPendiente = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png', iconSize: [30, 30] });
const iconEntregado = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', iconSize: [30, 30] });
const iconRetrasado = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png', iconSize: [30, 30] });

const getIconByEstado = (estado) => {
  switch (estado) {
    case 'pendiente': return iconPendiente;
    case 'entregado': return iconEntregado;
    case 'retrasado': return iconRetrasado;
    default: return iconPendiente;
  }
};

const iconConductor = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995621.png',
  iconSize: [32, 32],
});

const Mapa = () => {
  const { orders } = useContext(OrderContext);
  const { mapState } = useContext(MapContext);
  const { vehicles } = useContext(VehicleContext);
  const { drivers } = useContext(DriverContext);

  const [rutasOptimizadas, setRutasOptimizadas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [socketError, setSocketError] = useState(null);
  const socketRef = useRef(null);

  const assignments = mapState.assignments;

  const validOrders = orders
    .map(p => {
      const lat = Number(p.lat), lng = Number(p.lng);
      if (isNaN(lat) || isNaN(lng)) return null;
      return { ...p, position: [lat, lng] };
    })
    .filter(p => p);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!assignments) return;
      const rutas = [];

      for (const [vehiculoId, pedidoIds] of Object.entries(assignments)) {
        const pedidos = pedidoIds.map(id => validOrders.find(p => p.id === id)).filter(Boolean);
        const puntos = [baseLngLat, ...pedidos.map(p => `${p.lng},${p.lat}`)];
        if (puntos.length < 2) continue;

        try {
          const res = await axios.get(`http://router.project-osrm.org/route/v1/driving/${puntos.join(';')}?overview=full&geometries=geojson`);
          const route = res.data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

          rutas.push({ 
            vehiculoId, 
            ruta: coords, 
            duracion: route.duration,
            distancia: route.distance   
          });
        } catch (err) {
          console.error(`Error ruta ${vehiculoId}:`, err);
        }
      }

      setRutasOptimizadas(rutas);
    };

    fetchRoutes();
  }, [assignments, orders]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    console.log('⌛ Conectando a:', socketUrl);

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Conexión establecida ID:', socket.id);
      setSocketError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión:', err.message);
      setSocketError(`Error de conexión: ${err.message}`);
    });

    socket.on('ubicacion_conductor', (data) => {
      console.log('📍 Ubicación recibida:', data);
      if (!data || isNaN(data.lat) || isNaN(data.lng)) {
        console.error('Datos de ubicación inválidos:', data);
        return;
      }

      setUbicaciones(prev => {
        const otrasUbicaciones = prev.filter(u => u.dni !== data.dni);
        return [...otrasUbicaciones, {
          dni: data.dni,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          timestamp: data.timestamp || new Date().toISOString()
        }];
      });
    });

    // Enviar ubicación de prueba cada 5 segundos
    const interval = setInterval(() => {
      if (socket.connected) {
        const testData = {
          dni: 'test123',
          lat: -34.58 + Math.random() * 0.01,
          lng: -58.46 + Math.random() * 0.01,
          timestamp: new Date().toISOString(),
        };
        socket.emit('ubicacion', testData);
        console.log('📤 Enviando ubicación de prueba:', testData);
      }
    }, 5000);

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Desconectado:', reason);
    });

    return () => {
      clearInterval(interval);
      console.log('🧹 Limpiando socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {socketError && (
        <div className="alert alert-warning">
          {socketError} - Las ubicaciones en tiempo real no están disponibles
        </div>
      )}

      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer 
          center={basePosition} 
          zoom={13} 
          scrollWheelZoom 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='© OpenStreetMap contributors' 
          />

          <Marker position={basePosition}>
            <Popup>🚩 Punto de partida: Base Triunvirato y Tronador</Popup>
          </Marker>

          {validOrders.map(p => (
            <Marker key={p.id} position={p.position} icon={getIconByEstado(p.estado)}>
              <Popup>
                <b>{p.cliente || 'Cliente Desconocido'}</b><br />
                {p.direccion}<br />
                Estado: <b>{p.estado}</b>
              </Popup>
            </Marker>
          ))}

          {ubicaciones.map((ubicacion) => (
            <Marker
              key={`${ubicacion.dni}-${ubicacion.timestamp}`}
              position={[ubicacion.lat, ubicacion.lng]}
              icon={iconConductor}
            >
              <Popup>
                <b>🧍 Conductor: {ubicacion.dni}</b><br />
                Última actualización: {new Date(ubicacion.timestamp).toLocaleTimeString()}
              </Popup>
            </Marker>
          ))}

          {rutasOptimizadas.map(({ vehiculoId, ruta }, idx) => {
            const colors = ['blue', 'green', 'red', 'orange', 'purple', 'brown', 'black'];
            return (
              <Polyline 
                key={vehiculoId} 
                positions={ruta} 
                pathOptions={{ 
                  color: colors[idx % colors.length], 
                  weight: 5 
                }} 
              />
            );
          })}
        </MapContainer>
      </div>

      <div className="mt-4 px-3">
        <h3>Resumen de asignaciones</h3>
        {assignments ? Object.entries(assignments).map(([vehiculoId, pedidoIds]) => {
          const vehiculo = vehicles.find(v => v.id === +vehiculoId);
          const conductor = drivers.find(d => d.vehiculo_id === +vehiculoId);
          const pedidos = pedidoIds.map(id => validOrders.find(p => p.id === id)).filter(Boolean);
          const rutaData = rutasOptimizadas.find(r => r.vehiculoId === vehiculoId);

          return (
            <div key={vehiculoId} className="card mb-4 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>🚗 Vehículo #{vehiculoId}</h5>
                  <span className="badge bg-primary">{pedidoIds.length} pedidos</span>
                </div>
                <p>Tipo: {vehiculo?.tipo || 'N/A'} | Patente: {vehiculo?.patente || 'N/A'}</p>
                <p>👨‍💼 Conductor: {conductor ? `${conductor.nombre} ${conductor.apellido}` : 'Sin asignar'}</p>
                {rutaData && (
                  <>
                    <p>⏱️ ETA total: {Math.round(rutaData.duracion / 60)} min</p>
                    <p>📏 Distancia: {(rutaData.distancia / 1000).toFixed(2)} km</p>
                  </>
                )}
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">🚩 Punto de partida: Base Triunvirato y Tronador</li>
                  {pedidos.map(p => (
                    <li key={p.id} className="list-group-item">
                      📦 Pedido #{p.id} – {p.direccion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }) : <p>No hay asignaciones activas.</p>}
      </div>
    </div>
  );
};

export default Mapa;
