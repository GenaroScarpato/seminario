import React, { useEffect, useContext } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { ReportContext } from '../../context/ReportContext.jsx'; // Adjust path as necessary

const ReportesAdmin = () => {
  // Use useContext to get reportes, loading, error, and functions from ReportContext
  const { reportes, loading, error, fetchReportes, deleteReporte } = useContext(ReportContext);

  // Fetch reports when the component mounts, leveraging the context's fetcher
  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">Error al cargar reportes.</Alert>;
  if (!Array.isArray(reportes) || reportes.length === 0)
    return <Alert variant="info">No hay reportes registrados.</Alert>;

  return (
    <div className="p-4">
      <h2>Reportes de Conductores</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Conductor</th>
            <th>Tipo</th>
            <th>Mensaje</th>
            <th>Gravedad</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((r) => (
            <tr key={r.id}>
              <td>{r.nombre_conductor}</td>
              <td>{r.tipo}</td>
              <td>{r.mensaje}</td>
              <td>{r.gravedad}</td>
              <td>{new Date(r.creado_en).toLocaleString()}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => deleteReporte(r.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportesAdmin;