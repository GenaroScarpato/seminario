const express = require('express');
const router = express.Router();
const { getAll, create, getById, deleteConductor } = require('../controllers/conductores');

// Rutas
router.get('/', getAll);
router.post('/', create);
router.delete('/:id', deleteConductor);

module.exports = router;
