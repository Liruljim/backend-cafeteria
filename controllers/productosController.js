const service = require('../services/productoService');

const getAll = async (req, res) => {
  try {
    const data = await service.getAllProductos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await service.createProducto(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await service.updateProducto(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await service.deleteProducto(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAll, create, update, remove };