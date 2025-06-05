const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehiculos');

// Obtener todos los vehículos
router.get('/', vehicleController.getVehiculos);

// Obtener un vehículo por ID
router.get('/:id', vehicleController.getVehiculo);

// Filtrar vehículos
router.get('/filter', vehicleController.filtrarVehiculos);

// Crear nuevo vehículo
router.post('/', vehicleController.crearVehiculo);

// Actualizar vehículo
router.put('/:id', vehicleController.actualizarVehiculo);

// Eliminar vehículo
router.delete('/:id', vehicleController.eliminarVehiculo);

module.exports = router;
