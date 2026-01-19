const express = require('express');
const { getProductosPorPiso, registrarVenta } = require('../controllers/posController');
// Podrías agregar middleware de auth aquí si lo deseas
const router = express.Router();

// GET /api/pos/productos?piso_id=...
router.get('/productos', getProductosPorPiso);

// POST /api/pos/ventas
router.post('/ventas', registrarVenta);

module.exports = router;
