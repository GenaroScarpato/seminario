const express = require('express');
const router = express.Router();
const { asignarRutas, rutasAsignadas } = require('../controllers/asignacionController');
const  validarJWT  = require('../middleware/validarJwt');
router.post('/asignar-rutas', asignarRutas);
router.get('/rutasAsignadas',validarJWT , rutasAsignadas);

module.exports = router;
