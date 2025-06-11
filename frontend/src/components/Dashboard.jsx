import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ROUTES } from '@config/api';
const Dashboard = () => {
  // Estados para datos y UI
  const [pedidos, setPedidos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [clusters, setClusters] = useState(null);
  const [loadingClusters, setLoadingClusters] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos iniciales (pedidos, vehículos)
  useEffect(() => {
    fetchPedidos();
    fetchVehiculos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.PEDIDOS.ALL}`);
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      setError('Error cargando pedidos');
    }
  };

  const fetchVehiculos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.VEHICULOS.ALL}`);
      const data = await res.json();
      setVehiculos(data);
    } catch (err) {
      setError('Error cargando vehículos');
    }
  };

  // Función para ejecutar K-Means (backend)
  const runKMeans = async () => {
    setLoadingClusters(true);
    setError(null);
    try {
      const res = await fetch('/api/kmeans', { method: 'POST' });
      const data = await res.json();
      setClusters(data); // esperar { clusters: [...] }
    } catch (err) {
      setError('Error ejecutando K-Means');
    } finally {
      setLoadingClusters(false);
    }
  };

  return (
    <div className="container my-4">
      <h1>Dashboard Logística Inteligente</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="mb-4">
        <h2>Pedidos</h2>
        <p>Total pedidos: {pedidos.length}</p>
        {/* Aquí podría ir un componente tabla de pedidos */}
      </section>

      <section className="mb-4">
        <h2>Vehículos disponibles</h2>
        <p>Total vehículos: {vehiculos.length}</p>
        {/* Aquí podría ir tabla o lista de vehículos */}
      </section>

      <section className="mb-4">
        <h2>Clusterización (K-Means)</h2>
        <button
          className="btn btn-primary"
          onClick={runKMeans}
          disabled={loadingClusters}
        >
          {loadingClusters ? 'Procesando...' : 'Ejecutar K-Means'}
        </button>

        {clusters && (
          <div className="mt-3">
            <h3>Resultado Clusters</h3>
            <pre>{JSON.stringify(clusters, null, 2)}</pre>
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
