import React, { useEffect, useState, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { VehicleContext } from '../context/VehicleContext';
import { MapContext } from '../context/MapContext';
import { WebSocketContext } from '../context/WebSocketContext';
import { DriverProvider } from '../context/DriverContext';
import { initialMapState, initialWebSocketState } from '../context/initialState';
import { ReportProvider } from '../context/ReportContext';
import { API_BASE_URL, API_ROUTES } from '../config/api';
import styles from './AdminLayout.module.css';
import { FaBox, FaCar, FaUserTie, FaMap, FaChartBar, FaTachometerAlt } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [mapState, setMapState] = useState(initialMapState);
  const [webSocketState, setWebSocketState] = useState(initialWebSocketState);

  // Definir las funciones de fetch con useCallback
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.PEDIDOS.ALL}`);
      if (!res.ok) throw new Error('Error en la respuesta de pedidos');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error al cargar pedidos', err);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`);
      if (!res.ok) throw new Error('Error en la respuesta de vehículos');
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error('Error al cargar vehículos', err);
    }
  }, []);

  // Cargar datos al inicio
  useEffect(() => {
    fetchOrders();
    fetchVehicles();
  }, [fetchOrders, fetchVehicles]);

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/pedidos', icon: <FaBox />, label: 'Pedidos' },
    { path: '/admin/vehiculos', icon: <FaCar />, label: 'Vehículos' },
    { path: '/admin/conductores', icon: <FaUserTie />, label: 'Conductores' },
    { path: '/admin/mapa', icon: <FaMap />, label: 'Mapa' },
    { path: '/admin/reportes', icon: <FaChartBar />, label: 'Reportes' },
  ];

  return (
    <ReportProvider>
      <OrderContext.Provider value={{ orders, setOrders, fetchOrders }}>
        <VehicleContext.Provider value={{ vehicles, setVehicles, fetchVehicles }}>
          <DriverProvider>
            <MapContext.Provider value={{ mapState, setMapState }}>
              <WebSocketContext.Provider value={{ webSocketState, setWebSocketState }}>
                <div className={styles.layoutContainer}>
                  <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                      <div className={styles.sidebarLogo}>
                        <span className={styles.sidebarLogoIcon}>📦</span>
                        <h1 className={styles.sidebarLogoText}>LogiTrack</h1>
                      </div>
                    </div>

                    <nav className={styles.navMenu}>
                      {menuItems.map((item, index) => (
                        <div key={index} className={styles.navItem}>
                          <Link
                            to={item.path}
                            className={`${styles.navLink} ${location.pathname === item.path ? 'active' : ''}`}
                          >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {location.pathname === item.path && <span className={styles.activeDot} />}
                          </Link>
                        </div>
                      ))}
                    </nav>

                    <div className={styles.footer}>
                      <div className={styles.sessionStatus}>
                        <span className={styles.sessionDot} />
                        <span>Sesión activa</span>
                      </div>
                      <p>Sistema de Logística v1.0</p>
                    </div>
                  </aside>

                  <main className={styles.mainContent}>
                    <div className={styles.contentCard}>
                      <div className={styles.contentBody}>
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
    </ReportProvider>
  );
};

export default AdminLayout;
