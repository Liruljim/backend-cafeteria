const express = require('express');
const router = express.Router();
const creditosController = require('../controllers/creditosController');

// Listar clientes con saldo pendiente
router.get('/clientes', creditosController.getClientesConSaldo);

// Obtener historial detallado por cliente
router.get('/historial/:cliente_id', creditosController.getHistorialCliente);

// Registrar pago total
router.post('/pagar-total', creditosController.pagarDeudaTotal);

module.exports = router;
