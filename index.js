const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const usuariosRoutes = require('./routes/usuariosRouter');
const categoriasRoutes = require('./routes/categoriasRoutes');
const proveedoresRoutes = require('./routes/proveedoresRoutes');
const productosRoutes = require('./routes/productosRoutes');
const pisoRoutes = require('./routes/pisoRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');

const app = express();

app.use(cors()); 
app.use(express.json());

const verificarRol = require('./middlewares/verificarRol');

app.use('/auth', authRoutes);

app.use('/api/pos', verificarRol(['admin', 'vendedor']), require('./routes/posRoutes'));

app.use('/clientes', verificarRol(['admin', 'vendedor']), clientesRoutes);
app.use('/api/pisos', verificarRol(['admin', 'vendedor']), pisoRoutes);
app.use('/api/tasa', verificarRol(['admin', 'vendedor']), require('./routes/tasaRoutes'));

app.use('/usuarios', usuariosRoutes);
app.use('/api/categorias', verificarRol(['admin']), categoriasRoutes);
app.use('/api/proveedores', verificarRol(['admin']), proveedoresRoutes);
app.use('/api/productos', verificarRol(['admin']), productosRoutes);
app.use('/api/inventario', verificarRol(['admin']), inventarioRoutes);
app.use('/api/reportes', verificarRol(['admin']), require('./routes/reportesRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
