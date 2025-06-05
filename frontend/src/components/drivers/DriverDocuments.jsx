import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ROUTES } from '../../config/api';

const DriverDocuments = ({ driverId }) => {
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (driverId) {
      fetchDocuments();
    }
  }, [driverId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.DOCUMENTS.replace(':id', driverId)}`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocument(file);
    }
  };

  const handleUpload = async () => {
    if (!newDocument) return;

    try {
      const formData = new FormData();
      formData.append('file', newDocument);

      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.UPLOAD.replace(':id', driverId)}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        fetchDocuments();
        setNewDocument(null);
        setShowModal(false);
      } else {
        throw new Error('Error al subir documento');
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error al subir el documento. Por favor, inténtalo de nuevo.');
    }
  };

  const handleViewDocument = (url) => {
    window.open(url, '_blank');
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}${API_ROUTES.DRIVERS.DOCUMENTS.replace(':id', driverId)}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDocuments();
      } else {
        throw new Error('Error al eliminar documento');
      }
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      alert('Error al eliminar el documento. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="modal fade" id="driverDocumentsModal" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Documentación del Conductor</h5>
            <button 
              type="button" 
              className="btn-close" 
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <button 
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                Subir nuevo documento
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Fecha de Emisión</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.tipo}</td>
                      <td>{new Date(doc.fecha_emision).toLocaleDateString()}</td>
                      <td>{new Date(doc.fecha_vencimiento).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-info btn-sm me-1"
                          onClick={() => handleViewDocument(doc.url)}
                        >
                          Ver
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} 
           style={{ display: showModal ? 'block' : 'none' }}
           tabIndex="-1"
           role="dialog"
           aria-labelledby="uploadModalLabel"
           aria-hidden={!showModal}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="uploadModalLabel">Subir Documento</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setNewDocument(null);
                  setShowModal(false);
                }}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Tipo de documento</label>
                <select className="form-select">
                  <option value="licencia">Licencia de Conducir</option>
                  <option value="seguro">Seguro</option>
                  <option value="certificado">Certificado Médico</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Archivo *</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha de Vencimiento</label>
                <input type="date" className="form-control" />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setNewDocument(null);
                  setShowModal(false);
                }}
              >
                Cerrar
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleUpload}
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDocuments;
