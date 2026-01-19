const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportesController');

router.get('/ventas', controller.getReporteVentas);

module.exports = router;
