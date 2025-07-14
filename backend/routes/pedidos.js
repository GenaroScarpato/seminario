// routes/pedidos.js
const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos');

router.get('/', pedidosController.getPedidos);
router.post('/', pedidosController.createPedido);
router.put('/:id/estado', pedidosController.updateEstadoPedido); // Nueva ruta
router.put('/:id', pedidosController.updatePedido);
router.delete('/:id', pedidosController.deletePedido);

module.exports = router;
