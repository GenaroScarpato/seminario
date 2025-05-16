const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculos');

// GET todos los vehículos
router.get('/', vehiculoController.getVehiculos);

// POST nuevo vehículo
router.post('/', vehiculoController.crearVehiculo);

// PUT actualizar vehículo
router.put('/:id', vehiculoController.actualizarVehiculo);

// DELETE eliminar vehículo
router.delete('/:id', vehiculoController.eliminarVehiculo);

module.exports = router;
 