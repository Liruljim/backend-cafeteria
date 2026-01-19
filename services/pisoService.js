const supabase = require('../config/supabaseClient');

const getAllPisos = async () => {
  const { data, error } = await supabase.from('pisos').select('*');
  if (error) throw error;
  return data;
};

const createPiso = async (data) => {
  const { data: newPiso, error } = await supabase.from('pisos').insert([data]).select().single();
  if (error) throw error;
  
  // Optional: Auto-create inventory for existing products for this new floor?
  // Not explicitly required but good practice. Skipped for simplicity unless requested.
  
  return newPiso;
};

const updatePiso = async (id, data) => {
  const { data: updated, error } = await supabase.from('pisos').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
};

const deletePiso = async (id) => {
  const { error } = await supabase.from('pisos').delete().eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = {
  getAllPisos,
  createPiso,
  updatePiso,
  deletePiso
};
