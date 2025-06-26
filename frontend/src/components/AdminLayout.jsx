import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { VehicleContext } from '../context/VehicleContext';
import { MapContext } from '../context/MapContext';
import { WebSocketContext } from '../context/WebSocketContext';
import { DriverProvider } from '../context/DriverContext'; // 🔥 Este es el bueno
import { initialMapState, initialWebSocketState } from '../context/initialState';
import { API_BASE_URL, API_ROUTES } from '../config/api';

const AdminLayout = () => {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [mapState, setMapState] = useState(initialMapState);
  const [webSocketState, setWebSocketState] = useState(initialWebSocketState);

  useEffect(() => {
    fetchPedidos();
    fetchVehiculos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.PEDIDOS.ALL}`);
      if (!res.ok) throw new Error('Error en la respuesta de pedidos');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error al cargar pedidos', err);
    }
  };

  const fetchVehiculos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`);
      if (!res.ok) throw new Error('Error en la respuesta de vehículos');
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error('Error al cargar vehículos', err);
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/pedidos', icon: '📦', label: 'Pedidos' },
    { path: '/admin/vehiculos', icon: '🚗', label: 'Vehículos' },
    { path: '/admin/conductores', icon: '👨‍💼', label: 'Conductores' },
    { path: '/admin/mapa', icon: '🗺️', label: 'Mapa' },
    { path: '/admin/reportes', icon: '📊', label: 'Reportes' },
  ];

  return (
    <OrderContext.Provider value={{ orders, setOrders }}>
      <VehicleContext.Provider value={{ vehicles, setVehicles }}>
        <DriverProvider> {/* ✅ Este es el Provider con lógica incluida */}
          <MapContext.Provider value={{ mapState, setMapState }}>
            <WebSocketContext.Provider value={{ webSocketState, setWebSocketState }}>
              <div className="d-flex bg-light" style={{ minHeight: '100vh' }}>
                <aside className="bg-white border-end" style={{ width: '250px' }}>
                  <div className="d-flex align-items-center justify-content-center py-3 border-bottom">
                    <span className="fs-4 text-primary me-2">📦</span>
                    <h2 className="mb-0 text-primary">Panel Admin</h2>
                  </div>

                  <nav className="mt-3">
                    <div className="nav flex-column">
                      {menuItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.path}
                          className={`nav-link d-flex align-items-center px-3 py-2 ${
                            location.pathname === item.path ? 'bg-primary text-white' : 'text-dark'
                          }`}
                        >
                          <span className="me-2">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </nav>
                </aside>

                <main className="flex-grow-1 p-4">
                  <div className="card">
                    <div className="card-body">
                      <Outlet />
                    </div>
                  </div>
                </main>
              </div>
            </WebSocketContext.Provider>
          </MapContext.Provider>
        </DriverProvider>
      </VehicleContext.Provider>
    </OrderContext.Provider>
  );
};

export default AdminLayout;
