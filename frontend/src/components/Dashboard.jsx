import React, { useContext, useState } from 'react';
import axios from 'axios';
import { OrderContext } from '../context/OrderContext';
import { VehicleContext } from '../context/VehicleContext';
import PedidoTable from './pedidos/PedidoTable';
import VehicleTable from './vehicles/VehicleTable';
import { MapContext } from '../context/MapContext';
import { API_BASE_URL, API_ROUTES } from '@config/api';
const Dashboard = () => {
  const { orders } = useContext(OrderContext);
  const { vehicles } = useContext(VehicleContext);
  const [assignments, setAssignments] = useState(null);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setMapState } = useContext(MapContext);

const vehiculosDisponibles = vehicles.filter(v => v.estado === 'disponible' );

const ordersPending = orders.filter(p => p.estado === 'pendiente');

  const asignarPedidos = async () => {
    setLoading(true);
    setError(null);
    setAssignments(null);
    setUnassignedOrders([]);

    try {
      const res = await axios.post('http://127.0.0.1:8000/asignar-pedidos', {
        pedidos: ordersPending,
        vehiculos: vehiculosDisponibles
      });
            const asignaciones = res.data.asignaciones || {};
            const no_asignados = res.data.no_asignados || [];

          await axios.post(`${API_BASE_URL}${API_ROUTES.ASIGNACIONES.ASIGNAR_PEDIDOS}`, { asignaciones });

      setAssignments(asignaciones);
      setUnassignedOrders(no_asignados);
      setMapState(prev => ({
        ...prev,
        assignments: res.data.asignaciones,
        unassigned: res.data.no_asignados || []
      }));

    } catch (err) {
      console.error(err);
      setError('Error en la respuesta del servidor');
    } finally {
      setLoading(false);
    }
  };

  const extraerDireccionCorta = (direccionCompleta) => {
    const partes = direccionCompleta.split(',');
    const tieneNumeroInicial = /^\d+/.test(partes[0].trim());
    let calleConNumero = '';
    let barrio = '';

    if (tieneNumeroInicial) {
      calleConNumero = `${partes[1].trim()} ${partes[0].trim()}`;
      barrio = partes[2]?.trim() || '';
    } else {
      const numeroEnParte1 = partes[1]?.match(/\d+/);
      if (numeroEnParte1) {
        calleConNumero = `${partes[0].trim()} ${numeroEnParte1[0]}`;
        barrio = partes[2]?.trim() || '';
      } else {
        calleConNumero = partes[0].trim();
        barrio = partes[2]?.trim() || '';
      }
    }

    return `${calleConNumero} - ${barrio}`;
  };

  const getPedidoResumen = (pedidoId) => {
    const pedido = orders.find(p => p.id === pedidoId);
    if (!pedido) return `Pedido #${pedidoId}`;
    const direccionCorta = extraerDireccionCorta(pedido.direccion);
    return `Pedido #${pedido.id} - ${direccionCorta}`;
  };

  const getVehicleInfo = (vehiculoId) => {
    const vehiculo = vehicles.find(v => v.id === parseInt(vehiculoId));
    if (!vehiculo) return `Vehículo ${vehiculoId}`;
    return ` (${vehiculo.patente}) ${vehiculo.tipo} - Capacidad: ${vehiculo.capacidad} kg`;
  };

  const getPedidoDetails = (pedidoId) => {
    const pedido = orders.find(p => p.id === pedidoId);
    if (!pedido) return {};
    return {
      direccion: pedido.direccion,
      peso: pedido.peso,
      volumen: pedido.volumen
    };
  };

  return (
    <div className="container my-4">
      <h1>Dashboard Logística Inteligente</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* 🔹 KPIs */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">Pedidos totales</h5>
              <p className="card-text fs-4">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">Pedidos asignados</h5>
              <p className="card-text fs-4">
                {assignments ? Object.values(assignments).flat().length : 0}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3">
            <div className="card-body">
              <h5 className="card-title">No asignados</h5>
              <p className="card-text fs-4">{unassignedOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info mb-3">
            <div className="card-body">
              <h5 className="card-title">Vehículos disponibles</h5>
              <p className="card-text fs-4">{vehiculosDisponibles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Asignación */}
      <section className="mb-4">
        <h2>Asignar Pedidos</h2>
        <button
          className="btn btn-primary"
          onClick={asignarPedidos}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Asignar pedidos automáticamente'}
        </button>
      </section>

      {/* 🔹 Resultado de asignación */}
      {assignments && (
        <section className="mb-4">
          <h3>Resumen por vehículo</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Pedidos asignados</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(assignments).map(([vehiculoId, pedidos]) => (
                <tr key={vehiculoId}>
                  <td>{getVehicleInfo(vehiculoId)}</td>
                  <td>
                    <ul className="mb-0 ps-3">
                      {pedidos.map(id => (
                        <li key={id}>{getPedidoResumen(id)}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* 🔹 Pedidos no asignados */}
      {unassignedOrders.length > 0 && (
        <section className="mb-4">
          <div className="alert alert-warning">
            <h4>Pedidos no asignados</h4>
            <p>Los siguientes pedidos no pudieron ser asignados:</p>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dirección</th>
                  <th>Peso</th>
                  <th>Volumen</th>
                </tr>
              </thead>
              <tbody>
                {unassignedOrders.map(id => {
                  const d = getPedidoDetails(id);
                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{d.direccion}</td>
                      <td>{d.peso}</td>
                      <td>{d.volumen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 🔹 Tablas opcionales */}
      <section className="mb-4">
        <h2>Todos los Pedidos</h2>
<PedidoTable pedidos={orders} showActions={false} /> 
     </section>

      <section className="mb-4">
        <h2>Vehículos disponibles</h2>
        <VehicleTable vehicles={vehiculosDisponibles} showActions={false} />
      </section>

      {/* 🔹 Futuro: IA */}
      <section className="mb-4">
        <h2>IA - Funciones próximas</h2>
        <ul>
          <li>Predicción de ETA</li>
          <li>Recomendación de rutas óptimas</li>
          <li>Gamificación de conductores</li>
          <li>Detección de zonas problemáticas</li>
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
