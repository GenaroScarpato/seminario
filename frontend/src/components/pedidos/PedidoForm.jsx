import React, { useState } from 'react';

const PedidoForm = ({ onSubmit, pedido = null }) => {
  const [formData, setFormData] = useState({
    direccion: pedido?.direccion || '',
    lat: pedido?.lat || '',
    lng: pedido?.lng || '',
    volumen: pedido?.volumen || '',
    peso: pedido?.peso || '',
    estado: pedido?.estado || 'pendiente',
    scheduled_at: pedido?.scheduled_at ? pedido.scheduled_at.slice(0,16) : '' // formato datetime-local
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
            <label htmlFor="direccion" className="form-label">Dirección</label>
            <input 
              type="text" 
              className="form-control" 
              id="direccion" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="lat" className="form-label">Latitud</label>
            <input 
              type="number" 
              className="form-control" 
              id="lat" 
              name="lat" 
              value={formData.lat} 
              onChange={handleChange} 
              required
              step="any"
            />
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="lng" className="form-label">Longitud</label>
            <input 
              type="number" 
              className="form-control" 
              id="lng" 
              name="lng" 
              value={formData.lng} 
              onChange={handleChange} 
              required
              step="any"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="volumen" className="form-label">Volumen</label>
            <input 
              type="number" 
              className="form-control" 
              id="volumen" 
              name="volumen" 
              value={formData.volumen} 
              onChange={handleChange} 
              required
              step="any"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="peso" className="form-label">Peso</label>
            <input 
              type="number" 
              className="form-control" 
              id="peso" 
              name="peso" 
              value={formData.peso} 
              onChange={handleChange} 
              step="any"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="estado" className="form-label">Estado</label>
            <select 
              className="form-select" 
              id="estado" 
              name="estado" 
              value={formData.estado} 
              onChange={handleChange} 
              required
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_camino">En camino</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="scheduled_at" className="form-label">Programado para</label>
            <input 
              type="datetime-local" 
              className="form-control" 
              id="scheduled_at" 
              name="scheduled_at" 
              value={formData.scheduled_at} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
        >
          {pedido ? 'Actualizar' : 'Crear'} Pedido
        </button>
      </form>
    </div>
  );
};

export default PedidoForm;
