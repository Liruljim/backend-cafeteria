const express = require('express');
const { 
  registrarUsuario, 
  listarUsuarios, 
  obtenerUsuario, 
  actualizarUsuario, 
  eliminarUsuario 
} = require('../controllers/usuariosController');
const verificarRol = require('../middlewares/verificarRol');

const router = express.Router();

// Middleware global para este router: Solo admin puede acceder
router.use(verificarRol(['admin']));

router.post('/', registrarUsuario);
router.get('/', listarUsuarios);
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;