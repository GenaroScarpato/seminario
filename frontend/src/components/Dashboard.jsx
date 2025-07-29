import React, { useContext, useState } from 'react';
import axios from 'axios';
import { OrderContext } from '../context/OrderContext';
import { VehicleContext } from '../context/VehicleContext';
import PedidoTable from './pedidos/PedidoTable';
import VehicleTable from './vehicles/VehicleTable';
import { MapContext } from '../context/MapContext';
import { API_BASE_URL, API_ROUTES } from '@config/api';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { orders } = useContext(OrderContext);
  const { vehicles } = useContext(VehicleContext);
  const [assignments, setAssignments] = useState(null);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setMapState } = useContext(MapContext);

  const vehiculosDisponibles = vehicles.filter(v => v.estado === 'disponible' && v.conductor_id && v.conductor_estado === 'disponible');
  const ordersPending = orders.filter(p => p.estado === 'pendiente');
const asignarPedidos = async () => {
  setLoading(true);
  setError(null);
  setAssignments(null);
  setUnassignedOrders([]);

  try {
    // 1) Llamás al optimizador externo
    const res = await axios.post('http://127.0.0.1:8000/asignar-pedidos', {
      pedidos: ordersPending,
      vehiculos: vehiculosDisponibles
    });

    const asignaciones = res.data?.asignaciones ?? {};
    const no_asignados = res.data?.no_asignados ?? [];

    // 2) Validar que asignaciones sea objeto y no esté vacío
    if (
      !asignaciones ||
      typeof asignaciones !== 'object' ||
      Object.keys(asignaciones).length === 0
    ) {
      throw new Error('El optimizador devolvió asignaciones vacías o inválidas');
    }

    // 3) Asegurarse que cada valor sea array (por si acaso)
    const asignacionesOrdenadas = {};
    for (const vehiculoId in asignaciones) {
      if (Array.isArray(asignaciones[vehiculoId])) {
        asignacionesOrdenadas[vehiculoId] = asignaciones[vehiculoId];
      } else {
        asignacionesOrdenadas[vehiculoId] = [];
      }
    }

    console.log('Asignaciones para enviar al backend:', asignacionesOrdenadas);

    // 4) Mandás al backend con orden correcto
    await axios.post(
      `${API_BASE_URL}${API_ROUTES.ASIGNACIONES.ASIGNAR_PEDIDOS}`,
      { asignaciones: asignacionesOrdenadas }
    );

    // 5) Actualizás estados locales
    setAssignments(asignacionesOrdenadas);
    setUnassignedOrders(no_asignados);
    setMapState(prev => ({
      ...prev,
      assignments: asignacionesOrdenadas,
      unassigned: no_asignados
    }));

  } catch (err) {
    console.error(err?.response?.data || err);
    setError(
      err?.response?.data?.msg ||
      err?.response?.data?.message ||
      'Error en la respuesta del servidor'
    );
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
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>Dashboard Logística Inteligente</h1>
        {error && <div className="alert alert-danger">{error}</div>}
      </div>

     {/* 🔹 KPIs */}
<div className={styles.kpiGrid}>
  <div className={`${styles.kpiCard} ${styles.primary}`}>
    <h5>📦 Pedidos totales</h5>
    <p>{orders.length}</p>
  </div>
  <div className={`${styles.kpiCard} ${styles.success}`}>
    <h5>✅ Pedidos asignados</h5>
    <p>{assignments ? Object.values(assignments).flat().length : 0}</p>
  </div>
  <div className={`${styles.kpiCard} ${styles.warning}`}>
    <h5>❌ No asignados</h5>
    <p>{unassignedOrders.length}</p>
  </div>
  <div className={`${styles.kpiCard} ${styles.info}`}>
    <h5>🚚 Vehículos disponibles</h5>
    <p>{vehiculosDisponibles.length}</p>
  </div>
</div>


      {/* 🔹 Asignación */}
      <section className={styles.section}>
        <h2>Asignar Pedidos</h2>
        <button
          className={styles.assignButton}
          onClick={asignarPedidos}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Asignar pedidos automáticamente'}
        </button>
      </section>

      {/* 🔹 Resultado de asignación */}
     {/* 🔹 Resultado de asignación */}
{assignments && (
  <section className={styles.assignmentSection}>
    <h3>Resumen por vehículo</h3>
    <table className={styles.enhancedTable}>
      <thead>
        <tr>
          <th>Vehículo</th>
          <th>Pedidos asignados</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(assignments).map(([vehiculoId, pedidos]) => (
          <tr key={vehiculoId}>
            <td>{getVehicleInfo(vehiculoId)}</td>
            <td>
              <ul style={{margin: 0, paddingLeft: '1rem'}}>
                {pedidos.map(id => (
                  <li key={id}>{getPedidoResumen(id)}</li>
                ))}
              </ul>
            </td>
            <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Asignado</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
)}

{/* 🔹 Pedidos no asignados */}
{unassignedOrders.length > 0 && (
  <section className={styles.unassignedSection}>
    <div className={styles.unassignedHeader}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3>Pedidos no asignados</h3>
    </div>
    <p>Los siguientes pedidos no pudieron ser asignados por falta de capacidad vehicular:</p>
    <table className={styles.enhancedTable}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Dirección</th>
          <th>Peso</th>
          <th>Volumen</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {unassignedOrders.map(id => {
          const d = getPedidoDetails(id);
          return (
            <tr key={id}>
              <td>{id}</td>
              <td>{d.direccion}</td>
              <td>{d.peso} kg</td>
              <td>{d.volumen} m³</td>
              <td><span className={`${styles.badge} ${styles.badgeDanger}`}>No asignado</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </section>
)}
      {/* 🔹 Tablas opcionales */}
  {/* 🔹 Tablas opcionales */}
<section className={styles.section}>
  <h2>Todos los Pedidos</h2>
  <PedidoTable 
    pedidos={orders} 
    showActions={false}
    className={styles.enhancedTable} 
  /> 
</section>

<section className={styles.section}>
  <h2>Vehículos disponibles</h2>
  <VehicleTable 
    vehicles={vehiculosDisponibles} 
    showActions={false}
    className={styles.enhancedTable}
  />
</section>
      {/* 🔹 Futuro: IA */}
  {/* 🔹 Futuro: IA */}
<section className={styles.aiSection}>
  <h2>IA - Funciones próximas</h2>
  <div className={styles.aiFeatures}>
    <div className={styles.aiFeatureCard}>
      <div className={styles.aiFeatureIcon}>⏱️</div>
      <h3>Predicción de ETA</h3>
      <p>Estimación precisa de tiempos de llegada usando modelos predictivos avanzados.</p>
    </div>
    <div className={styles.aiFeatureCard}>
      <div className={styles.aiFeatureIcon}>🗺️</div>
      <h3>Recomendación de rutas</h3>
      <p>Optimización inteligente de rutas considerando tráfico, clima y otros factores.</p>
    </div>
    <div className={styles.aiFeatureCard}>
      <div className={styles.aiFeatureIcon}>⚠️</div>
      <h3>Detección de zonas</h3>
      <p>Identificación proactiva de áreas con problemas recurrentes de entrega.</p>
    </div>
  </div>
</section>
    </div>
  );
};

export default Dashboard;