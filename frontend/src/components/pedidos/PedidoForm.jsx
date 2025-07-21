import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { remove as removeDiacritics } from 'diacritics'; // npm install diacritics

const PedidoForm = ({ onSubmit, pedido = null }) => {
  const [formData, setFormData] = useState({
    direccion: pedido?.direccion || '',
    volumen: pedido?.volumen || '',
    peso: pedido?.peso || '',
    estado: pedido?.estado || 'pendiente',
    scheduled_at: pedido?.scheduled_at ? pedido.scheduled_at.slice(0, 16) : ''
  });

// NUEVO: actualizar cuando cambia el pedido
useEffect(() => {
  setFormData({
    direccion: pedido?.direccion || '',
    volumen: pedido?.volumen || '',
    peso: pedido?.peso || '',
    estado: pedido?.estado || 'pendiente',
    scheduled_at: pedido?.scheduled_at ? pedido.scheduled_at.slice(0, 16) : ''
  });
}, [pedido]);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  
  useEffect(() => {
    if (formData.direccion.length < 3) {
      setSuggestions([]);
      setSelectedLocation(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: formData.direccion,
            format: 'json',
            addressdetails: 1,
            limit: 10,
            countrycodes: 'ar',
          }
        });

        const inputNorm = removeDiacritics(formData.direccion.toLowerCase());

        const filtered = res.data.filter(item => {
          const displayNorm = removeDiacritics(item.display_name.toLowerCase());
          return displayNorm.includes(inputNorm);
        });

        setSuggestions(filtered.length > 0 ? filtered : res.data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [formData.direccion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      direccion: suggestion.display_name
    }));
    setSelectedLocation(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let location = selectedLocation;

      if (!location) {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: formData.direccion,
            format: 'json',
            limit: 10,
            countrycodes: 'ar',
            addressdetails: 1,
          }
        });

        const inputNorm = removeDiacritics(formData.direccion.toLowerCase());

        const filtered = res.data.filter(item => {
          const displayNorm = removeDiacritics(item.display_name.toLowerCase());
          return displayNorm.includes(inputNorm);
        });

        if (filtered.length === 0) {
          throw new Error('No se encontró la dirección en Argentina');
        }

        location = filtered[0];
      }

      const pedidoConCoords = {
        ...formData,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon)
      };

      await onSubmit(pedidoConCoords);
    } catch (err) {
      setError('Error al obtener coordenadas. Revisá la dirección y que sea en Argentina.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="container">
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        {/* Dirección con sugerencias */}
        <div className="mb-3 col-md-12 position-relative">
          <label htmlFor="direccion" className="form-label fw-bold">Dirección</label>
          <input
            type="text"
            className="form-control"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          {suggestions.length > 0 && (
            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '150px', overflowY: 'auto' }}>
              {suggestions.map(suggestion => (
                <li
                  key={suggestion.place_id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{ cursor: 'pointer' }}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Volumen y Peso */}
        <div className="mb-3 col-md-6">
          <label htmlFor="volumen" className="form-label fw-bold">Volumen (m³)</label>
          <input
            type="number"
            className="form-control"
            id="volumen"
            name="volumen"
            value={formData.volumen}
            onChange={handleChange}
            required
            step="any"
            min="0"
          />
        </div>

        <div className="mb-3 col-md-6">
          <label htmlFor="peso" className="form-label fw-bold">Peso (kg)</label>
          <input
            type="number"
            className="form-control"
            id="peso"
            name="peso"
            value={formData.peso}
            onChange={handleChange}
            step="any"
            min="0"
          />
        </div>
  <div className="mb-3 col-md-6">
  <label htmlFor="estado" className="form-label fw-bold">Estado</label>
  <select
    className="form-select"
    id="estado"
    name="estado"
    value={formData.estado}
    onChange={handleChange}
  >
    <option value="pendiente">Pendiente</option>
    <option value="en camino">En camino</option>
    <option value="entregado">Entregado</option>
    <option value="cancelado">Cancelado</option>
  </select>
</div>

 

        <div className="mb-3 col-md-6">
          <label htmlFor="scheduled_at" className="form-label fw-bold">Programado para</label>
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

      {error && <div className="alert alert-danger mt-2">{error}</div>}

      <div className="row">
        <div className="col-md-12 mt-3">
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold"
            disabled={loading}
          >
            {loading ? 'Cargando...' : (pedido ? 'Actualizar' : 'Crear')} Pedido
          </button>
        </div>
      </div>
    </form>
  </div>
);

};

export default PedidoForm;
