import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from './components/AdminLayout';
import PedidosAdmin from './components/PedidosAdmin';
import VehiclesAdmin from './components/vehicles/VehiclesAdmin';
import DriversAdmin from './components/drivers/DriversAdmin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Navigate to="pedidos" replace />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="vehiculos" element={<VehiclesAdmin />} />
          <Route path="conductores" element={<DriversAdmin />} />
        </Route>
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}
