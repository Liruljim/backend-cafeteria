const supabase = require('../config/supabaseClient');

// 📌 Crear proveedor
async function crearProveedor(req, res) {
  const { nombre, telefono, direccion, email } = req.body;

  try {
    const { data, error } = await supabase
      .from('proveedores')
      .insert([{ nombre, telefono, direccion, email }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Proveedor creado exitosamente', proveedor: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 Listar proveedores
async function listarProveedores(req, res) {
  try {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 Actualizar proveedor
async function actualizarProveedor(req, res) {
  const { id } = req.params;
  const { nombre, telefono, direccion, email } = req.body;

  try {
    const { data, error } = await supabase
      .from('proveedores')
      .update({ nombre, telefono, direccion, email })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Proveedor actualizado', proveedor: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 Eliminar proveedor
async function eliminarProveedor(req, res) {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Proveedor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearProveedor,
  listarProveedores,
  actualizarProveedor,
  eliminarProveedor
};