import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

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

const Mapa = () => {
  const { orders } = useContext(OrderContext);
  const { mapState } = useContext(MapContext);
  const { vehicles } = useContext(VehicleContext);
  const { drivers } = useContext(DriverContext);

  const [rutasOptimizadas, setRutasOptimizadas] = useState([]);
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
          console.log('Ruta OSRM:', route);

          rutas.push({ 
            vehiculoId, 
            ruta: coords, 
              duracion: route.duration,    // en segundos
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

  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer center={basePosition} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap contributors' />

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

          {rutasOptimizadas.map(({ vehiculoId, ruta }, idx) => {
            const colors = ['blue', 'green', 'red', 'orange', 'purple', 'brown', 'black'];
            return <Polyline key={vehiculoId} positions={ruta} pathOptions={{ color: colors[idx % colors.length], weight: 5 }} />;
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
                  {pedidos.map(p => <li key={p.id} className="list-group-item">📦 Pedido #{p.id} – {p.direccion}</li>)}
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
