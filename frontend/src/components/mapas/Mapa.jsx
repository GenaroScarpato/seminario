import React, { useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { OrderContext } from '../../context/OrderContext.jsx';
import { MapContext } from '../../context/MapContext.jsx';
import PedidoTable from '../pedidos/PedidoTable.jsx';

const basePosition = [-34.58402190, -58.46702480];

// Iconos representativos por estado
const iconPendiente = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png',
  iconSize: [30, 30],
});
const iconEntregado = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
  iconSize: [30, 30],
});
const iconRetrasado = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png',
  iconSize: [30, 30],
});

const getIconByEstado = (estado) => {
  switch (estado) {
    case 'pendiente':
      return iconPendiente;
    case 'entregado':
      return iconEntregado;
    case 'retrasado':
      return iconRetrasado;
    default:
      return iconPendiente;
  }
};

const Mapa = () => {
  const { orders } = useContext(OrderContext);
  const { mapState } = useContext(MapContext);
  const assignments = mapState.assignments;

  if (!Array.isArray(orders)) return <div>Cargando pedidos...</div>;

  const validOrders = orders
    .map(p => {
      const lat = Number(p.lat);
      const lng = Number(p.lng);
      if (isNaN(lat) || isNaN(lng)) return null;
      return { ...p, position: [lat, lng] };
    })
    .filter(p => p !== null);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer center={basePosition} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <Marker position={basePosition}>
          <Popup>Punto de partida: Base Triunvirato y Tronador</Popup>
        </Marker>

        {validOrders.map(pedido => (
          <Marker
            key={pedido.id}
            position={pedido.position}
            icon={getIconByEstado(pedido.estado)}
          >
            <Popup>
              <b>{pedido.cliente || 'Cliente Desconocido'}</b><br />
              Dirección: {pedido.direccion}<br />
              Estado: <b>{pedido.estado}</b>
            </Popup>
          </Marker>
        ))}

        {/* RUTAS ASIGNADAS */}
        {assignments &&
          Object.entries(assignments).map(([vehiculoId, pedidoIds], idx) => {
            const colors = ['blue', 'green', 'red', 'orange', 'purple', 'brown', 'black'];
            const color = colors[idx % colors.length];

            const ruta = pedidoIds
              .map(id => {
                const p = validOrders.find(p => p.id === id);
                return p ? p.position : null;
              })
              .filter(p => p !== null);

            if (ruta.length === 0) return null;

            return (
              <Polyline
                key={vehiculoId}
                positions={ruta}
                pathOptions={{ color }}
              />
            );
          })}
      </MapContainer>

      <PedidoTable pedidos={validOrders} />
    </div>
  );
};

export default Mapa;
