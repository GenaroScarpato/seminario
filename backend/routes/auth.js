const express = require('express');
const router = express.Router();
const { loginConductor } = require('../controllers/auth');

router.post('/login', loginConductor);

module.exports = router;
