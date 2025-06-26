import React, { useState } from 'react';

const VehicleForm = ({ onSubmit, vehicle = null }) => {
  const [formData, setFormData] = useState({
    patente: vehicle?.patente || '',
    marca: vehicle?.marca || '',
    modelo: vehicle?.modelo || '',
    anio: vehicle?.anio || '',
    tipo: vehicle?.tipo || '',
    capacidad: vehicle?.capacidad || 0,
    estado: vehicle?.estado || 'disponible'
  });
  const regexPatente = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2}|\d{3}[A-Z]{3}|\d{2,4}[A-Z]{1,3}|[A-Z]{1,3}\d{2,4}|[A-Z]{3}-\d{3,4})$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!regexPatente.test(formData.patente.trim().toUpperCase())) {
      alert('La patente ingresada no es válida. Asegurate de usar un formato conocido como ABC123 o AB123CD.');
      return;
    }
    

    // Validar marca y modelo (entre 2 y 50 caracteres)
    if (formData.marca.length < 2 || formData.marca.length > 50) {
      alert('La marca debe tener entre 2 y 50 caracteres');
      return;
    }
    if (formData.modelo.length < 2 || formData.modelo.length > 50) {
      alert('El modelo debe tener entre 2 y 50 caracteres');
      return;
    }

    // Validar año (entre 1900 y año actual)
    const currentYear = new Date().getFullYear();
    if (formData.anio < 1900 || formData.anio > currentYear) {
      alert(`El año debe estar entre 1900 y ${currentYear}`);
      return;
    }

    // Validar tipo
    if (!['auto', 'camioneta', 'moto', 'camión'].includes(formData.tipo)) {
      alert('Por favor, selecciona un tipo válido');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="patente" className="form-label">Patente</label>
            <input 
              type="text" 
              className="form-control" 
              id="patente" 
              name="patente" 
              value={formData.patente} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="marca" className="form-label">Marca</label>
            <input 
              type="text" 
              className="form-control" 
              id="marca" 
              name="marca" 
              value={formData.marca} 
              onChange={handleChange} 
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="modelo" className="form-label">Modelo</label>
            <input 
              type="text" 
              className="form-control" 
              id="modelo" 
              name="modelo" 
              value={formData.modelo} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="anio" className="form-label">Año</label>
            <input 
              type="number" 
              className="form-control" 
              id="anio" 
              name="anio" 
              value={formData.anio} 
              onChange={handleChange} 
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="capacidad" className="form-label">Capacidad</label>
            <input 
              type="number" 
              className="form-control" 
              id="capacidad" 
              name="capacidad" 
              value={formData.capacidad} 
              onChange={handleChange} 
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="estado" className="form-label">Estado</label>
            <select 
              className="form-control" 
              id="estado" 
              name="estado" 
              value={formData.estado} 
              onChange={handleChange} 
            >
              <option value="disponible">Disponible</option>
              <option value="en_servicio">En servicio</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="tipo" className="form-label">Tipo</label>
            <select 
              className="form-select" 
              id="tipo" 
              name="tipo" 
              value={formData.tipo} 
              onChange={handleChange} 
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="auto">Auto</option>
              <option value="camioneta">Camioneta</option>
              <option value="moto">Moto</option>
              <option value="camión">Camión</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
        >
          Agregar Vehículo
        </button>
      </form>
    </div>
  );
};

export default VehicleForm;
