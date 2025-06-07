import React, { useState } from 'react';
import axios from 'axios';

const DriverForm = ({ onSubmit, driver, vehicles, onError }) => {
  const [formData, setFormData] = useState({
    nombre: driver?.nombre || '',
    apellido: driver?.apellido || '',
    telefono: driver?.telefono || '',
    email: driver?.email || '',
    licencia: driver?.licencia || '',
    estado: driver?.estado || 'disponible',
    tipo_archivo: 'documento'
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setFormData(prev => ({
        ...prev,
        licencia: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    if (!formData.licencia && !file) newErrors.licencia = 'La licencia es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (file) {
        formDataToSend.append('archivo', file);
      }
      
      await onSubmit(formDataToSend);
    } catch (error) {
      console.error('Error al guardar el conductor:', error);
      onError?.(error.response?.data?.error || 'Error al guardar el conductor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate encType="multipart/form-data">
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="nombre" className="form-label">Nombre Completo *</label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="apellido" className="form-label">Apellido</label>
          <input
            type="text"
            className="form-control"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
          />
          {errors.apellido && <div className="invalid-feedback d-block">{errors.apellido}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="telefono" className="form-label">Teléfono *</label>
          <input
            type="tel"
            className="form-control"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="email" className="form-label">Email *</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="estado" className="form-label">Estado *</label>
          <select
            className="form-select"
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <option value="disponible">Disponible</option>
            <option value="ocupado">Ocupado</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="licencia" className="form-label">Número de Licencia *</label>
          <input
            type="text"
            className="form-control"
            id="licencia"
            name="licencia"
            value={formData.licencia}
            onChange={handleChange}
            required
          />
          {errors.licencia && <div className="invalid-feedback d-block">{errors.licencia}</div>}
        </div>

        <div className="col-md-12 mb-3">
          <label htmlFor="archivo" className="form-label">Documento de Licencia (Opcional)</label>
          <input
            type="file"
            className="form-control"
            id="archivo"
            name="archivo"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <div className="form-text">Puedes subir una imagen o PDF de la licencia (máx. 10MB)</div>
          {file && (
            <div className="mt-2">
              <p className="mb-1">Archivo seleccionado: {file.name}</p>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => setFile(null)}
              >
                Remover archivo
              </button>
            </div>
          )}
          {errors.archivo && <div className="invalid-feedback d-block">{errors.archivo}</div>}
        </div>

        <div className="col-12">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              </>
            ) : driver ? (
              'Actualizar Conductor'
            ) : (
              'Crear Conductor'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DriverForm;
