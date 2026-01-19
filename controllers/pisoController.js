const service = require('../services/pisoService');

const getAll = async (req, res) => {
  try {
    const data = await service.getAllPisos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await service.createPiso(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await service.updatePiso(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await service.deletePiso(req.params.id);
    res.json({ message: 'Piso eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAll, create, update, remove };
