const service = require('../services/inventarioService');

const getInventario = async (req, res) => {
  try {
    const { producto_id, piso_id } = req.query;
    const data = await service.getInventario({ producto_id, piso_id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const ajustarStock = async (req, res) => {
  try {
    const data = await service.ajustarStock(req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMovimientos = async (req, res) => {
  try {
    const data = await service.getMovimientos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteInventario = async (req, res) => {
  try {
    const { producto_id, piso_id } = req.query; // DELETE /api/inventario?producto_id=...&piso_id=...
    if (!producto_id || !piso_id) {
       return res.status(400).json({ error: 'Se requiere producto_id y piso_id' });
    }
    await service.deleteInventario(producto_id, piso_id);
    res.json({ message: 'Registro de inventario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const moverInventario = async (req, res) => {
  try {
      await service.moverInventario(req.body);
      res.json({ message: 'Inventario movido con éxito' });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

module.exports = { getInventario, ajustarStock, getMovimientos, deleteInventario, moverInventario };
