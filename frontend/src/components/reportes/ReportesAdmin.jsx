import React, { useEffect, useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';

const ReportesAdmin = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock de datos simulados
  const mockReportes = [
    {
      id: 1,
      nombre_conductor: 'Juan Pérez',
      tipo: 'Demora',
      mensaje: 'Tráfico intenso en Av. Siempre Viva',
      fecha: '2025-07-15T10:30:00Z',
    },
    {
      id: 2,
      nombre_conductor: 'Ana Gómez',
      tipo: 'Obstáculo',
      mensaje: 'Calles cerradas por obras',
      fecha: '2025-07-14T16:45:00Z',
    },
    {
        id: 3,
      nombre_conductor: 'María Rodríguez',
        tipo: 'Demora',
      mensaje: 'Tráfico intenso en Av. Siempre Viva',
      fecha: '2025-07-15T10:30:00Z',
    },
    {
      id: 4,
      nombre_conductor: 'Juan Pérez',
      tipo: 'Demora',
      mensaje: 'Tráfico intenso en Av. Siempre Viva',
      fecha: '2025-07-15T10:30:00Z',
    },
    
  ];

  const fetchReportesMock = () => {
    setTimeout(() => {
      setReportes(mockReportes);
      setLoading(false);
    }, 1000); // Simula retardo de red
  };

  const eliminarReporte = (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este reporte?');
    if (!confirmar) return;
    setReportes((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    fetchReportesMock();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (reportes.length === 0) return <Alert variant="info">No hay reportes registrados.</Alert>;

  return (
    <div className="p-4">
      <h2>Reportes de Conductores</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Conductor</th>
            <th>Tipo</th>
            <th>Mensaje</th>
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
              <td>{new Date(r.fecha).toLocaleString()}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => eliminarReporte(r.id)}>
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
