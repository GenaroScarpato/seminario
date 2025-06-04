import React, { useState } from 'react';

const VehicleForm = ({ onSubmit, vehicle = null }) => {
  const [formData, setFormData] = useState({
    patente: vehicle?.patente || '',
    marca: vehicle?.marca || '',
    modelo: vehicle?.modelo || '',
    anio: vehicle?.anio || '',
    tipo: vehicle?.tipo || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

        <div className="mb-3">
          <label htmlFor="tipo" className="form-label">Tipo</label>
            <select 
              className="form-select" 
              id="tipo" 
              name="tipo" 
              defaultValue={formData.tipo}
              onChange={handleChange} 
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="auto">Auto</option>
              <option value="camioneta">Camioneta</option>
              <option value="moto">Moto</option>
            </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
        >
          {vehicle ? 'Actualizar' : 'Crear'} Vehículo
        </button>
      </form>
    </div>
  );
};

export default VehicleForm;
