const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verificarRol = require('../middlewares/verificarRol');

router.get('/metrics', verificarRol(['admin']), dashboardController.getMetrics);

module.exports = router;
