const express = require('express');
const router = express.Router();
const rutasController = require('../controllers/rutas');

router.get('/', rutasController.getRutas);
router.post('/', rutasController.createRuta);
router.put('/:id', rutasController.updateRuta);
router.delete('/:id', rutasController.deleteRuta);

module.exports = router;
