// controllers/pedidos.js
const pedidosModel = require('../models/pedidos');

async function getPedidos(req, res) {
  try {
    const pedidos = await pedidosModel.getAll(req.pool);
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createPedido(req, res) {
  try {
    const pedidoData = req.body;
    const nuevoPedido = await pedidosModel.create(req.pool, pedidoData);
    res.status(201).json(nuevoPedido);
  } catch (err) {
    console.log(nuevoPedido)
    res.status(400).json({ error: err.message });
  }
}

async function updatePedido(req, res) {
  try {
    const id = req.params.id;
    const pedidoData = req.body;
    const pedidoActualizado = await pedidosModel.update(req.pool, id, pedidoData);
    res.json(pedidoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
// En tu archivo de controlador (ej. controllers/pedidosController.js)

async function updateEstadoPedido(req, res) {
  try {
    const id = req.params.id;
    const { estado } = req.body; // Solo esperamos el campo 'estado'
    if (!estado) {
      return res.status(400).json({ error: 'El estado es requerido.' });
    }
    const pedidoActualizado = await pedidosModel.updateEstado(req.pool, id, estado);
    res.json(pedidoActualizado);
  } catch (err) {
    console.error('Error al actualizar el estado del pedido:', err.message);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el estado del pedido.' });
  }
}




async function deletePedido(req, res) {
  try {
    const id = req.params.id;
    await pedidosModel.delete(req.pool, id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPedidos,
  createPedido,
  updatePedido,
  deletePedido,
  updateEstadoPedido
};
