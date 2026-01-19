const service = require('../services/categoriaService');

const getAll = async (req, res) => {
  try {
    const data = await service.getAllCategories();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await service.createCategory(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await service.updateCategory(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await service.deleteCategory(req.params.id);
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAll, create, update, remove };
