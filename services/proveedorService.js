const supabase = require('../config/supabaseClient');

const getAllProveedores = async (categoryId) => {
  let query = supabase.from('proveedores').select('*, categorias!category_id(nombre)');
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const createProveedor = async (data) => {
  // Validate category exists
  if (data.category_id) {
    const { data: cat, error: catErr } = await supabase.from('categorias').select('id').eq('id', data.category_id).single();
    if (catErr || !cat) throw new Error('Categoría inválida');
  }

  const { data: newProv, error } = await supabase.from('proveedores').insert([data]).select().single();
  if (error) throw error;
  return newProv;
};

const updateProveedor = async (id, data) => {
  const { data: updated, error } = await supabase.from('proveedores').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
};

const deleteProveedor = async (id) => {
  const { error } = await supabase.from('proveedores').delete().eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = {
  getAllProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor
};
