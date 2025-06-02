import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [form, setForm] = useState({
    address: '',
    volume: '',
    scheduled_at: '',
  });

  // Carga inicial de pedidos
  useEffect(() => {
    axios.get('/api/pedidos')
      .then(res => {
        setPedidos(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error('Error al obtener pedidos:', err);
        setPedidos([]);
      });
  }, []);

  // Manejo de inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Crear nuevo pedido
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const nuevoPedido = {
        ...form,
        lat: 0,
        lng: 0,
        assigned_to: null,
        status: 'pendiente',
      };
      const res = await axios.post('/api/pedidos', nuevoPedido);
      setPedidos([...pedidos, res.data]);
      setForm({ address: '', volume: '', scheduled_at: '' });
    } catch (err) {
      console.error('Error al crear pedido:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Pedidos</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 mb-6 bg-white p-4 rounded shadow">
        <input
          type="text"
          name="address"
          placeholder="Dirección"
          value={form.address}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="volume"
          placeholder="Volumen"
          value={form.volume}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="datetime-local"
          name="scheduled_at"
          value={form.scheduled_at}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear Pedido
        </button>
      </form>

      <table className="w-full border text-left bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Dirección</th>
            <th className="p-2">Volumen</th>
            <th className="p-2">Fecha Programada</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.address}</td>
              <td className="p-2">{p.volume}</td>
              <td className="p-2">{p.scheduled_at?.slice(0, 16).replace('T', ' ') || '-'}</td>
              <td className="p-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PedidosAdmin;
