import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/admin/pedidos" className="hover:bg-gray-700 px-3 py-2 rounded">
            📦 Pedidos
          </Link>
          <Link to="/admin/conductores" className="hover:bg-gray-700 px-3 py-2 rounded">
            🚚 Conductores
          </Link>
          <Link to="/admin/reportes" className="hover:bg-gray-700 px-3 py-2 rounded">
            📊 Reportes
          </Link>
        </nav>
      </aside>

      {/* Contenido donde se renderizan las rutas hijas */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
