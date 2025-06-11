import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '@/components/AdminLayout';
import PedidosAdmin from '@/components/pedidos/PedidosAdmin';
import VehiclesAdmin from '@/components/vehicles/VehiclesAdmin';
import DriversAdmin from '@/components/drivers/DriversAdmin';
import CreateDriver from '@/pages/drivers/CreateDriver';
import Dashboard from './components/Dashboard';

const AdminDashboard = () => (
  <div className="container mt-5">
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body text-center">
            <h1 className="card-title">Bienvenido al Panel de Administración</h1>
            <p className="card-text">Selecciona una opción del menú lateral para comenzar</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="vehiculos" element={<VehiclesAdmin />} />
          <Route path="conductores" element={<DriversAdmin />} />
          <Route path="conductores/nuevo" element={<CreateDriver />} />
        </Route>
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}
