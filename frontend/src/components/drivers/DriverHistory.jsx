import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ROUTES } from '../../config/api';

const DriverHistory = ({ driverId }) => {
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (driverId) {
      fetchDriverHistory();
      fetchDriverFeedback();
    }
  }, [driverId]);

  const fetchDriverHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.HISTORY.replace(':id', driverId)}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const fetchDriverFeedback = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.FEEDBACK.replace(':id', driverId)}`);
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error('Error al cargar feedback:', error);
    }
  };

  const handleViewHistory = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="modal fade" id="driverHistoryModal" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Historial del Conductor</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleCloseModal}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="tab-content">
              <div className="tab-pane fade show active" id="history">
                <h6 className="mb-3">Rutas Realizadas</h6>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Estado</th>
                        <th>Calificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((route) => (
                        <tr key={route.id}>
                          <td>{new Date(route.fecha).toLocaleDateString()}</td>
                          <td>{route.origen}</td>
                          <td>{route.destino}</td>
                          <td>
                            <span className={`badge bg-${route.estado === 'completada' ? 'success' : 'warning'}`}>
                              {route.estado}
                            </span>
                          </td>
                          <td>
                            {route.calificacion ? (
                              <span className="text-warning">
                                {Array(route.calificacion).fill('⭐').join('')}
                              </span>
                            ) : (
                              'Sin calificación'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="tab-pane fade" id="feedback">
                <h6 className="mb-3">Feedback</h6>
                <div className="list-group">
                  {feedback.map((fb) => (
                    <div key={fb.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{fb.cliente}</h6>
                        <small>{new Date(fb.fecha).toLocaleDateString()}</small>
                      </div>
                      <p className="mb-1">{fb.comentario}</p>
                      <div className="text-warning">
                        {Array(fb.calificacion).fill('⭐').join('')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleCloseModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverHistory;
