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
  deletePedido
};
