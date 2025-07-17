import React, { createContext, useState, useEffect, useCallback } from 'react'; // Import useCallback
import { API_BASE_URL, API_ROUTES } from '@config/api'; // Ensure this path is correct for your project

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize fetchReportes using useCallback to ensure a stable function reference
  const fetchReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.REPORTES.ALL}`);
      if (!res.ok) throw new Error('Error al obtener reportes');
      const data = await res.json();
      setReportes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [setReportes, setLoading, setError]); // Dependencies: setState functions are stable

  // Memoize createReporte
  const createReporte = useCallback(async (reporteData) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.REPORTES.CREATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reporteData),
      });
      if (!res.ok) throw new Error('Error al crear reporte');
      await fetchReportes(); // This calls the memoized fetchReportes
      return true;
    } catch (error) {
      console.error(error);
      setError(error.message);
      return false;
    }
  }, [fetchReportes, setError]); // Depend on fetchReportes (which is memoized) and setError

  // Memoize updateReporte
  const updateReporte = useCallback(async (reporteData) => {
    try {
      if (!reporteData.id) throw new Error('Falta ID del reporte');
      const res = await fetch(
        `${API_BASE_URL}${API_ROUTES.REPORTES.UPDATE.replace(':id', reporteData.id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reporteData),
        }
      );
      if (!res.ok) throw new Error('Error al actualizar reporte');
      await fetchReportes(); // This calls the memoized fetchReportes
      return true;
    } catch (error) {
      console.error(error);
      setError(error.message);
      return false;
    }
  }, [fetchReportes, setError]); // Depend on fetchReportes (which is memoized) and setError

  // Memoize deleteReporte
  const deleteReporte = useCallback(async (id) => {
    try {
      const confirmar = window.confirm('¿Seguro que querés eliminar este reporte?');
      if (!confirmar) return false;

      const res = await fetch(
        `${API_BASE_URL}${API_ROUTES.REPORTES.DELETE.replace(':id', id)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Error al eliminar reporte');
      await fetchReportes(); // This calls the memoized fetchReportes
      return true;
    } catch (error) {
      console.error(error);
      setError(error.message);
      return false;
    }
  }, [fetchReportes, setError]); // Depend on fetchReportes (which is memoized) and setError

  // Memoize simple getter functions that depend on 'reportes' state
  const getReporteById = useCallback((id) => {
    return reportes.find((reporte) => reporte.id === id);
  }, [reportes]);

  const getReportesByConductor = useCallback((dniConductor) => {
    return reportes.filter((reporte) => reporte.dni_conductor === dniConductor);
  }, [reportes]);

  const getReportesByGravedad = useCallback((gravedad) => {
    return reportes.filter((reporte) => reporte.gravedad.toLowerCase() === gravedad.toLowerCase());
  }, [reportes]);

  // Initial data load: useEffect with memoized fetchReportes as dependency
  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]); // fetchReportes is now a stable reference due to useCallback

  return (
    <ReportContext.Provider
      value={{
        reportes,
        loading,
        error,
        fetchReportes,
        createReporte,
        updateReporte,
        deleteReporte,
        getReporteById,
        getReportesByConductor,
        getReportesByGravedad,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};