import React, { useContext, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import axios from 'axios';
import { io } from 'socket.io-client';

import { OrderContext } from '../../context/OrderContext.jsx';
import { MapContext } from '../../context/MapContext.jsx';
import { VehicleContext } from '../../context/VehicleContext.jsx';
import { DriverContext } from '../../context/DriverContext.jsx';
import { ReportContext } from '../../context/ReportContext.jsx';

const basePosition = [-34.58402190, -58.46702480];
const baseLngLat = `${basePosition[1]},${basePosition[0]}`;

// ICONOS
const iconPendiente = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png', iconSize: [30, 30] });
const iconEntregado = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', iconSize: [30, 30] });
const iconCancelado = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png', iconSize: [30, 30] });
const iconEnCamino = new L.Icon({ iconUrl: '/image.png', iconSize: [30, 30] });

const getIconByEstado = (estado) => {
  switch (estado) {
    case 'pendiente': return iconPendiente;
    case 'entregado': return iconEntregado;
    case 'cancelado': return iconCancelado;
    case 'en_camino': return iconEnCamino;
    default: return iconPendiente;
  }
};

const iconConductor = new L.Icon({
  iconUrl: 'https://static.thenounproject.com/png/car-top-view-icon-7680677-512.png',
  iconSize: [45, 45],
});

// Componente para manejar el heatmap
const HeatmapLayer = ({ reportes }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    console.log('Heatmap Effect Triggered. Map Instance:', map);

    if (!map) {
      console.log('Map instance not available yet.');
      return;
    }

    console.log('Current reports for heatmap:', reportes);

    if (!reportes || reportes.length === 0) {
      console.log('No reports found or reports array is empty. Removing heatmap if present.');
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    const gravedadToIntensity = (g) => {
      const valor = parseFloat(g);
      const intensity = isNaN(valor) ? 0.3 : Math.max(0.1, Math.min(valor / 10, 1.0));
      console.log(`Gravedad: ${g}, Converted Intensity: ${intensity}`);
      return intensity;
    };

    const heatData = reportes.map(r => {
      const lat = parseFloat(r.lat) || basePosition[0] + Math.random() * 0.02 - 0.01;
      const lng = parseFloat(r.lng) || basePosition[1] + Math.random() * 0.02 - 0.01;
      return [lat, lng, gravedadToIntensity(r.gravedad)];
    });

    console.log('Generated Heatmap Data:', heatData);

    // Eliminar capa anterior si existe
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      console.log('Removed previous heatmap layer.');
    }

    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      minOpacity: 0.5,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    });

    heatLayerRef.current.addTo(map);
    console.log('Heatmap layer added to map.');

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
        console.log('Heatmap layer cleaned up on unmount.');
      }
    };
  }, [reportes, map]);

  return null; // Este componente no renderiza nada visual
};

const Mapa = () => {
  const { orders } = useContext(OrderContext);
  const { mapState } = useContext(MapContext);
  const { vehicles } = useContext(VehicleContext);
  const { drivers } = useContext(DriverContext);
  const { reportes } = useContext(ReportContext);

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
    .filter(Boolean);

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
          console.error(`Error fetching route for vehicle ${vehiculoId}:`, err);
        }
      }

      setRutasOptimizadas(rutas);
    };

    fetchRoutes();
  }, [assignments, orders]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      setSocketError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setSocketError(`Connection error: ${err.message}`);
    });

    socket.on('ubicacion_conductor', (data) => {
      if (!data || isNaN(data.lat) || isNaN(data.lng)) return;

      setUbicaciones(prev => {
        const otras = prev.filter(u => u.dni !== data.dni);
        return [...otras, {
          dni: data.dni,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          timestamp: data.timestamp || new Date().toISOString()
        }];
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
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
          {socketError} - Real-time locations are not available.
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

          {/* Componente para manejar el heatmap */}
          <HeatmapLayer reportes={reportes} />

          <Marker position={basePosition}>
            <Popup>🚩 Starting Point: Base Triunvirato y Tronador</Popup>
          </Marker>

          {validOrders.map(p => (
            <Marker key={p.id} position={p.position} icon={getIconByEstado(p.estado)}>
              <Popup>
                <b>{p.cliente || 'Unknown Client'}</b><br />
                {p.direccion}<br />
                Status: <b>{p.estado}</b>
              </Popup>
            </Marker>
          ))}

          {ubicaciones.map(ubicacion => (
            <Marker
              key={`${ubicacion.dni}-${ubicacion.timestamp}`}
              position={[ubicacion.lat, ubicacion.lng]}
              icon={iconConductor}
            >
              <Popup>
                <b>🚗 Driver: {ubicacion.dni}</b><br />
                Last Update: {new Date(ubicacion.timestamp).toLocaleTimeString()}
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