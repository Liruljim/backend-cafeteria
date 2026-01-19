const supabase = require('../config/supabaseClient');

async function getTasaActual(req, res) {
  try {
    const { data, error } = await supabase
      .from('tasas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { 
      throw error;
    }

    const tasa = data || { tasa: 1, created_at: new Date() };

    res.status(200).json(tasa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function setTasa(req, res) {
  const { tasa } = req.body;

  if (!tasa || isNaN(tasa) || tasa <= 0) {
    return res.status(400).json({ error: 'El valor de la tasa es inválido' });
  }

  try {
    const { data, error } = await supabase
      .from('tasas')
      .insert([{ tasa: parseFloat(tasa) }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Tasa actualizada correctamente', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getHistorialTasas(req, res) {
    try {
        const { data, error } = await supabase
          .from('tasas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
    
        if (error) throw error;
    
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

module.exports = {
  getTasaActual,
  setTasa,
  getHistorialTasas
};
