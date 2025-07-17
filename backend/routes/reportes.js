const express = require('express');
const router = express.Router();
const { getReportes, crearReporte, eliminarReporte } = require('../controllers/reportes');

router.get('/', getReportes);
router.post('/', crearReporte);
router.delete('/:id', eliminarReporte);

module.exports = router;
