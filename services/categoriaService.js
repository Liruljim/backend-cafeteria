const supabase = require('../config/supabaseClient');

const getAllCategories = async () => {
  const { data, error } = await supabase.from('categorias').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const createCategory = async (categoryData) => {
  const { data, error } = await supabase.from('categorias').insert([categoryData]).select().single();
  if (error) throw error;
  return data;
};

const updateCategory = async (id, categoryData) => {
  const { data, error } = await supabase.from('categorias').update(categoryData).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteCategory = async (id) => {
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
