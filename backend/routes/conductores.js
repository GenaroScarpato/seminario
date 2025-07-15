const express = require('express');
const router = express.Router();
const { getAll, create, getById, deleteConductor , update} = require('../controllers/conductores');

// Rutas
router.get('/', getAll);
router.post('/', create);
router.delete('/:id', deleteConductor);
router.put('/:id', update);

module.exports = router;
