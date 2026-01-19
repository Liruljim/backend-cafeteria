const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventarioController');

router.get('/', controller.getInventario);
router.put('/', controller.ajustarStock);
router.post('/mover', controller.moverInventario);
router.delete('/', controller.deleteInventario);

router.get('/movimientos', controller.getMovimientos);

module.exports = router;
