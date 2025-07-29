const express = require('express');
const router = express.Router();
const { getZonasConTrafico } = require('../controllers/trafico');

// Rutas
router.get('/zonas', getZonasConTrafico);

module.exports = router;
