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
    if (!map) return;

    // Si no hay reportes, removemos la capa si existía
    if (!reportes || reportes.length === 0) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    const gravedadToIntensity = (g) => {
      const valor = parseFloat(g);
      return isNaN(valor) ? 0.3 : Math.max(0.1, Math.min(valor / 5, 1.0));
    };

    const heatData = reportes.map(r => {
      const lat = parseFloat(r.lat) || basePosition[0] + Math.random() * 0.02 - 0.01;
      const lng = parseFloat(r.lng) || basePosition[1] + Math.random() * 0.02 - 0.01;
      return [lat, lng, gravedadToIntensity(r.gravedad)];
    });

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
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

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [reportes, map]);

  return null;
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
  const [showHeatmap, setShowHeatmap] = useState(false);

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

 // Reemplaza la sección del useEffect donde manejas 'ubicacion_conductor'
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
    console.log('Socket conectado exitosamente');
    setSocketError(null);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    setSocketError(`Connection error: ${err.message}`);
  });

  socket.on('ubicacion_conductor', (data) => {
    console.log('Datos recibidos del socket:', data); // Debug
    console.log('Drivers disponibles:', drivers); // Debug

    if (!data || isNaN(data.lat) || isNaN(data.lng)) {
      console.warn('Datos de ubicación inválidos:', data);
      return;
    }

    // Buscar conductor asociado por DNI (asegúrate de comparar como string)
    const conductor = drivers.find(d => String(d.dni) === String(data.dni));
    console.log('Conductor encontrado:', conductor); // Debug

    setUbicaciones(prev => {
      const otras = prev.filter(u => u.dni !== data.dni);
      const nuevaUbicacion = {
        dni: data.dni,
        nombre: conductor ? `${conductor.nombre} ${conductor.apellido}` : `Conductor ${data.dni}`,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      console.log('Nueva ubicación agregada:', nuevaUbicacion); // Debug
      return [...otras, nuevaUbicacion];
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
}, [drivers]); // IMPORTANTE: Agregar 'drivers' como dependencia

// También actualiza el Popup para mostrar mejor la información
{ubicaciones.map(ubicacion => (
  <Marker
    key={`${ubicacion.dni}-${ubicacion.timestamp}`}
    position={[ubicacion.lat, ubicacion.lng]}
    icon={iconConductor}
  >
    <Popup>
      <div style={{ textAlign: 'center' }}>
        <b>🚗 {ubicacion.nombre}</b><br />
        <small>DNI: {ubicacion.dni}</small><br />
        <small>Última actualización: {new Date(ubicacion.timestamp).toLocaleTimeString()}</small>
      </div>
    </Popup>
  </Marker>
))}

  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header moderno */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '1.5rem'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: '#1a202c',
          margin: '0 0 0.25rem 0'
        }}>
          Mapa de Entregas
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          margin: 0
        }}>
          Conductores en tiempo real y rutas optimizadas
        </p>
      </div>

      {/* Checkbox para mostrar/ocultar heatmap */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        marginBottom: '1rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={() => setShowHeatmap(prev => !prev)}
            style={{
              marginRight: '0.75rem',
              width: '1.125rem',
              height: '1.125rem',
              accentColor: '#3b82f6'
            }}
          />
          Mostrar mapa de calor de zonas problematicas (beta)
        </label>
      </div>

      {socketError && (
        <div style={{
          margin: '0 1.5rem 1rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#92400e'
        }}>
          <strong>Advertencia:</strong> {socketError} - Real-time locations are not available.
        </div>
      )}

      {/* Mapa con contenedor moderno */}
      <div style={{
        margin: '0 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
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

            {/* Renderizar heatmap solo si está activo */}
            {showHeatmap && <HeatmapLayer reportes={reportes} />}

            <Marker position={basePosition}>
              <Popup>🚩 Starting Point: Base Triunvirato y Tronador</Popup>
            </Marker>

            {validOrders.map(p => (
              <Marker key={p.id} position={p.position} icon={getIconByEstado(p.estado)}>
                <Popup>
                  <b>{p.cliente_nombre || 'Unknown Client'}</b><br />
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
  <b>🚗 {ubicacion.nombre}</b><br />
  Última actualización: {new Date(ubicacion.timestamp).toLocaleTimeString()}
</Popup>

              </Marker>
            ))}

            {rutasOptimizadas.map(({ vehiculoId, ruta }, idx) => {
              const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#84cc16', '#6b7280'];
              return (
                <Polyline
                  key={vehiculoId}
                  positions={ruta}
                  pathOptions={{
                    color: colors[idx % colors.length],
                    weight: 4,
                    opacity: 0.8
                  }}
                />
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Assignment Summary con estilos modernos */}
      <div style={{
        margin: '2rem 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header de la sección */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1a202c',
            margin: '0 0 0.25rem 0'
          }}>
            Resumen de Asignaciones
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: 0
          }}>
            Estado actual de vehículos y rutas
          </p>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {assignments ? Object.entries(assignments).map(([vehiculoId, pedidoIds]) => {
            const vehiculo = vehicles.find(v => v.id === +vehiculoId);
            const conductor = drivers.find(d => d.vehiculo_id === +vehiculoId);
            const pedidos = pedidoIds.map(id => validOrders.find(p => p.id === id)).filter(Boolean);
            const rutaData = rutasOptimizadas.find(r => r.vehiculoId === vehiculoId);

            return (
              <div key={vehiculoId} style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                {/* Header de la card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      marginRight: '0.75rem'
                    }}></div>
                    <h5 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1a202c',
                      margin: 0
                    }}>
                      🚗 Vehicle #{vehiculoId}
                    </h5>
                  </div>
                  <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {pedidoIds.length} orders
                  </span>
                </div>

                {/* Contenido de la card */}
                <div style={{ padding: '1.25rem' }}>
                  <p style={{
                    color: '#4b5563',
                    fontSize: '0.875rem',
                    margin: '0 0 0.75rem 0'
                  }}>
                    Type: <strong>{vehiculo?.tipo || 'N/A'}</strong> | License Plate: <strong>{vehiculo?.patente || 'N/A'}</strong>
                  </p>
                  <p style={{
                    color: '#4b5563',
                    fontSize: '0.875rem',
                    margin: '0 0 1rem 0'
                  }}>
                    👨‍💼 Driver: <strong>{conductor ? `${conductor.nombre} ${conductor.apellido}` : 'Unassigned'}</strong>
                  </p>
                  
                  {rutaData && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Tiempo</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>{Math.round(rutaData.duracion / 60)} min</div>
                      </div>
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Distancia</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>{(rutaData.distancia / 1000).toFixed(2)} km</div>
                      </div>
                    </div>
                  )}

                  {/* Lista de pedidos */}
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.75rem',
                      letterSpacing: '0.05em'
                    }}>
                      RUTA:
                    </div>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0
                    }}>
                      <li style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem 0',
                        fontSize: '0.875rem',
                        color: '#4b5563',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <div style={{
                          width: '0.5rem',
                          height: '0.5rem',
                          backgroundColor: '#10b981',
                          borderRadius: '50%',
                          marginRight: '0.75rem',
                          flexShrink: 0
                        }}></div>
                        🚩 Starting Point: Base Triunvirato y Tronador
                      </li>
                      {pedidos.map(p => (
                        <li key={p.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.5rem 0',
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          <div style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            marginRight: '0.75rem',
                            flexShrink: 0
                          }}></div>
                          📦 Order #{p.id} – {p.direccion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>📋</div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.5rem 0'
              }}>
                Sin asignaciones activas
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0
              }}>
                No hay vehículos con rutas asignadas en este momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mapa;