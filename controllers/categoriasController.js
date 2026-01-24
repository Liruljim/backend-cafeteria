const supabase = require('../config/supabaseClient');

// 📌 Crear categoría
async function crearCategoria(req, res) {
  const { nombre, descripcion } = req.body;

  try {
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre, descripcion }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Categoría creada exitosamente', categoria: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 Listar categorías
async function listarCategorias(req, res) {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 Actualizar categoría
async function actualizarCategoria(req, res) {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const { data, error } = await supabase
      .from('categorias')
      .update({ nombre, descripcion })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Categoría actualizada', categoria: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 Eliminar categoría
async function eliminarCategoria(req, res) {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearCategoria,
  listarCategorias,
  actualizarCategoria,
  eliminarCategoria
};