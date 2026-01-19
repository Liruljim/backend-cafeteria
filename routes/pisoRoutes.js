const express = require('express');
const router = express.Router();
const controller = require('../controllers/pisoController');
const verificarRol = require('../middlewares/verificarRol');

// Read - accessible to admin and vendedor (middleware applied in index.js)
router.get('/', controller.getAll);

// Write - admin only
router.post('/', verificarRol(['admin']), controller.create);
router.put('/:id', verificarRol(['admin']), controller.update);
router.delete('/:id', verificarRol(['admin']), controller.remove);

module.exports = router;

