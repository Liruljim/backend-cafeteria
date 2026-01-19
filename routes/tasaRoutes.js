const express = require('express');
const router = express.Router();
const controller = require('../controllers/tasaController');
const verificarRol = require('../middlewares/verificarRol');

// Read - accessible to admin and vendedor (middleware applied in index.js)
router.get('/actual', controller.getTasaActual);
router.get('/historial', controller.getHistorialTasas);

// Write - admin only
router.post('/', verificarRol(['admin']), controller.setTasa);

module.exports = router;

