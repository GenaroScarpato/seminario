const express = require('express');
const router = express.Router();

// Import controllers
const pedidosController = require('../controllers/pedidos');
const vehiculosController = require('../controllers/vehiculos');
const conductoresController = require('../controllers/conductores');

// Pedidos routes
router.get('/pedidos', pedidosController.getAll);
router.post('/pedidos', pedidosController.create);
router.put('/pedidos/:id', pedidosController.update);
router.delete('/pedidos/:id', pedidosController.delete);

// Vehiculos routes
router.get('/vehiculos', vehiculosController.getAll);
router.post('/vehiculos', vehiculosController.create);
router.put('/vehiculos/:id', vehiculosController.update);
router.delete('/vehiculos/:id', vehiculosController.delete);

// Conductores routes
router.get('/conductores', conductoresController.getAll);
router.post('/conductores', conductoresController.create);
router.put('/conductores/:id', conductoresController.update);
router.delete('/conductores/:id', conductoresController.delete);
router.get('/conductores/:id/historial', conductoresController.getHistory);
router.get('/conductores/:id/feedback', conductoresController.getFeedback);
router.get('/conductores/:id/documentos', conductoresController.getDocuments);
router.post('/conductores/:id/documentos/upload', conductoresController.uploadDocument);

module.exports = router;
