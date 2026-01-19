const service = require('../services/proveedorService');

const getAll = async (req, res) => {
  try {
    const categoryId = req.query.category_id;
    const data = await service.getAllProveedores(categoryId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await service.createProveedor(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await service.updateProveedor(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await service.deleteProveedor(req.params.id);
    res.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAll, create, update, remove };
