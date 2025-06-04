import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { VehicleContext } from '../context/VehicleContext';
import { DriverContext } from '../context/DriverContext';
import { MapContext } from '../context/MapContext';
import { WebSocketContext } from '../context/WebSocketContext';
import { 
  initialOrderState,
  initialVehicleState,
  initialDriverState,
  initialMapState,
  initialWebSocketState
} from '../context/initialState';

const AdminLayout = () => {
  const location = useLocation();
  
  // Menu items with icons and paths
  const menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: '📊',
      label: 'Dashboard',
      component: <div className="card">
        <div className="card-header">
          <h3 className="card-title text-primary">Dashboard</h3>
          <p className="text-muted">Visión general del sistema</p>
        </div>
        <div className="card-body">
          <Outlet />
        </div>
      </div>
    },
    { 
      path: '/admin/pedidos', 
      icon: '📦',
      label: 'Pedidos',
      component: <div className="card">
        <div className="card-header">
          <h3 className="card-title text-primary">Pedidos</h3>
          <p className="text-muted">Gestión de pedidos y entregas</p>
        </div>
        <div className="card-body">
          <Outlet />
        </div>
      </div>
    },
    { 
      path: '/admin/vehiculos', 
      icon: '🚗',
      label: 'Vehículos',
      component: <div className="card">
        <div className="card-header">
          <h3 className="card-title text-success">Vehículos</h3>
          <p className="text-muted">Gestión de flota</p>
        </div>
        <div className="card-body">
          <Outlet />
        </div>
      </div>
    },
    { 
      path: '/admin/conductores', 
      icon: '👨‍💼',
      label: 'Conductores',
      component: <div className="card">
        <div className="card-header">
          <h3 className="card-title text-info">Conductores</h3>
          <p className="text-muted">Gestión de conductores</p>
        </div>
        <div className="card-body">
          <Outlet />
        </div>
      </div>
    },
    { 
      path: '/admin/mapa', 
      icon: '🗺️',
      label: 'Mapa',
      component: <div className="card">
        <div className="card-header">
          <h3 className="card-title text-warning">Mapa</h3>
          <p className="text-muted">Visualización en tiempo real</p>
        </div>
        <div className="card-body">
          <Outlet />
        </div>
      </div>
    },
    { 
      path: '/admin/reportes', 
      icon: '📊',
      label: 'Reportes',
      component: <div className="card">
        <div className="card-header">
          <h3 className="card-title text-danger">Reportes</h3>
          <p className="text-muted">Estadísticas y métricas</p>
        </div>
        <div className="card-body">
          <Outlet />
        </div>
      </div>
    }
  ];

  return (
    <OrderContext.Provider value={initialOrderState}>
      <VehicleContext.Provider value={initialVehicleState}>
        <DriverContext.Provider value={initialDriverState}>
          <MapContext.Provider value={initialMapState}>
            <WebSocketContext.Provider value={initialWebSocketState}>
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
                      {menuItems.find(item => location.pathname === item.path)?.component || (
                        <div className="text-center py-5">
                          <h2 className="text-primary mb-3">Bienvenido al Panel Admin</h2>
                          <p className="text-muted">Seleccione una opción del menú para comenzar</p>
                        </div>
                      )}
                    </div>
                  </div>
                </main>
              </div>
            </WebSocketContext.Provider>
          </MapContext.Provider>
        </DriverContext.Provider>
      </VehicleContext.Provider>
    </OrderContext.Provider>
  );
};

export default AdminLayout;
