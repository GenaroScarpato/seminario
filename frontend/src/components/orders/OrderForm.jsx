import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../../context/OrderContext';

const OrderForm = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrderContext();
  const [form, setForm] = useState({
    address: '',
    volume: '',
    priority: 'normal',
    delivery_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createOrder(form);
      navigate('/admin/pedidos');
    } catch (err) {
      setError(err.message || 'Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title text-primary">Nuevo Pedido</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="mb-3">
            <label className="form-label">Dirección de Entrega</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="Ej: Calle 123, Ciudad"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Volumen (m³)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="form-control"
              name="volume"
              value={form.volume}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Prioridad</label>
            <select
              className="form-select"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              required
            >
              <option value="high">Alta</option>
              <option value="normal" selected>Normal</option>
              <option value="low">Baja</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Fecha de Entrega</label>
            <input
              type="datetime-local"
              className="form-control"
              name="delivery_date"
              value={form.delivery_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Notas</label>
            <textarea
              className="form-control"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Instrucciones especiales..."
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Pedido'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/pedidos')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
