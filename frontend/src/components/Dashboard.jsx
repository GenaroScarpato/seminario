import React, { useContext, useState } from 'react';
import axios from 'axios';
import { OrderContext } from '../context/OrderContext';
import { VehicleContext } from '../context/VehicleContext';
import PedidoTable from './pedidos/PedidoTable';
import VehicleTable from './vehicles/VehicleTable';
import { MapContext } from '../context/MapContext';

const Dashboard = () => {
  const { orders } = useContext(OrderContext);
  const { vehicles } = useContext(VehicleContext);
  const [assignments, setAssignments] = useState(null);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setMapState } = useContext(MapContext);
  const vehiculosDisponibles = vehicles.filter(v => v.estado === 'disponible');

  const asignarPedidos = async () => {
    setLoading(true);
    setError(null);
    setAssignments(null);
    setUnassignedOrders([]);

    try {
      const res = await axios.post('http://127.0.0.1:8000/asignar-pedidos', {
        pedidos: orders,
        vehiculos: vehiculosDisponibles
      });

      console.log("🛣️ Rutas optimizadas por vehículo:");
      Object.entries(res.data.asignaciones).forEach(([vehiculoId, ruta]) => {
        console.log(`Vehículo ${vehiculoId}:`, ruta);
      });

      if (res.data.no_asignados && res.data.no_asignados.length > 0) {
        console.log("❌ Pedidos no asignados:", res.data.no_asignados);
      }

      setAssignments(res.data.asignaciones);
      setUnassignedOrders(res.data.no_asignados || []);
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

      <section className="mb-4">
        <h2>Pedidos</h2>
        <p>Total pedidos: {orders ? orders.length : 0}</p>
        <PedidoTable pedidos={orders} />
      </section>

      <section className="mb-4">
        <h2>Vehículos disponibles</h2>
        <p>Total vehículos: {vehiculosDisponibles ? vehiculosDisponibles.length : 0}</p>
        <VehicleTable vehicles={vehiculosDisponibles} />
      </section>

      <section className="mb-4">
        <h2>Asignación de Pedidos</h2>
        <button
          className="btn btn-primary"
          onClick={asignarPedidos}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Asignar Pedidos'}
        </button>

        {assignments && (
          <div className="mt-3">
            <h3>Resultado de Asignación</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Direcciones de pedidos asignados</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(assignments).map(([vehiculoId, pedidos]) => (
                  <tr key={vehiculoId}>
                    <td>{getVehicleInfo(vehiculoId)}</td>
                    <td>
                      {pedidos.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {pedidos.map(id => (
                            <li key={id}>{getPedidoResumen(id)}</li>
                          ))}
                        </ul>
                      ) : (
                        'Sin pedidos asignados'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {unassignedOrders.length > 0 && (
          <div className="mt-4 alert alert-warning">
            <h4>Pedidos no asignados</h4>
            <p>Los siguientes pedidos no pudieron ser asignados a ningún vehículo:</p>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Dirección</th>
                  <th>Peso (kg)</th>
                  <th>Volumen (m³)</th>
                </tr>
              </thead>
              <tbody>
                {unassignedOrders.map(id => {
                  const details = getPedidoDetails(id);
                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{details.direccion || 'N/A'}</td>
                      <td>{details.peso || 'N/A'}</td>
                      <td>{details.volumen || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-4">
        <h2>Visualización de Mapas</h2>
        <p>Próximamente integración con Google Maps para mostrar pedidos, rutas y tráfico.</p>
      </section>

      <section className="mb-4">
        <h2>Inteligencia Artificial</h2>
        <ul>
          <li>ETA - Predicción de duración de entrega</li>
          <li>Asignación mejorada de pedidos</li>
          <li>Recomendación de horarios de salida</li>
          <li>Detección de zonas problemáticas</li>
          <li>Ranking y gamificación de conductores</li>
        </ul>
        <p>Estas funcionalidades se irán integrando en próximas versiones.</p>
      </section>
    </div>
  );
};

export default Dashboard;