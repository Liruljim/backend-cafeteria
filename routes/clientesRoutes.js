const express = require('express');
const {
  registrarCliente,
  listarClientes,
  buscarClientePorCedula,
  buscarClientes,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clientesController');
const verificarRol = require('../middlewares/verificarRol');


const router = express.Router();

// GET /clientes/buscar?q=...  (Antes de routes con :param para evitar conflicto)
router.get('/buscar', verificarRol(['admin', 'vendedor']), buscarClientes);

// POST /clientes → Registrar un nuevo cliente
router.post('/', verificarRol(['admin', 'vendedor']), registrarCliente);

// PUT /clientes/:id → Actualizar cliente
router.put('/:id', verificarRol(['admin', 'vendedor']), actualizarCliente);

// DELETE /clientes/:id → Eliminar cliente
router.delete('/:id', verificarRol(['admin']), eliminarCliente);

// GET /clientes → Listar todos los clientes
router.get('/', verificarRol(['admin', 'vendedor']), listarClientes);

// GET /clientes/:cedula → Buscar cliente por cédula
router.get('/:cedula', verificarRol(['admin', 'vendedor']), buscarClientePorCedula);

module.exports = router;