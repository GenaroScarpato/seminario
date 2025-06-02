const express = require('express');
const router = express.Router();
const { asignarRutas } = require('../controllers/asignacionController');

router.post('/asignar-rutas', asignarRutas);

module.exports = router;
