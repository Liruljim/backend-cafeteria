const express = require('express');
const { login, logout , registrarUsuario , eliminarUsuario, me } = require('../controllers/authController');

const router = express.Router();

// Login y logout
router.post('/login', login);
router.post('/logout', logout);
router.post('/register', registrarUsuario);
router.delete('/:id', eliminarUsuario);
router.get('/me', me);

module.exports = router;