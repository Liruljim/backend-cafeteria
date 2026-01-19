const supabase = require('../config/supabaseClient');

// 📌 Registrar un nuevo cliente
async function registrarCliente(req, res) {
  const { nombre, apellido, nac, cedula, telefono, email, direccion, area_number } = req.body;

  try {
    const payload = { 
        nombre, 
        apellido,
        nac: nac || 'V', // Default to V if missing, though frontend sends it
        cedula, 
        telefono, 
        area_number, 
        email: email || '', 
        direccion: direccion || '' 
    };

    const { data, error } = await supabase
      .from('clientes')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Cliente registrado exitosamente', cliente: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// 📌 Actualizar Cliente (PUT)
async function actualizarCliente(req, res) {
    const { id } = req.params;
    const { nombre, apellido, nac, cedula, telefono, email, direccion, area_number } = req.body;

    try {
        const { data, error } = await supabase
            .from('clientes')
            .update({ nombre, apellido, nac, cedula, telefono, email, direccion, area_number })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Cliente actualizado', cliente: data });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
}

// 📌 Eliminar Cliente (DELETE)
async function eliminarCliente(req, res) {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        res.status(200).json({ message: 'Cliente eliminado' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
}

async function listarClientes(req, res) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function buscarClientePorCedula(req, res) {
  const { cedula } = req.params;

  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('cedula', cedula)
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ error: 'Cliente no encontrado' });
  }
}

async function buscarClientes(req, res) {
  const { q } = req.query; 

  if (!q) {
    return res.status(200).json([]);
  }

  try {
    
    let query = supabase.from('clientes').select('*').limit(10);
    
    const isNumeric = /^\d+$/.test(q);

    if (isNumeric) {
        
       query = query.or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,cedula.eq.${q}`);
    } else {
       query = query.or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  registrarCliente,
  actualizarCliente,
  eliminarCliente,
  listarClientes,
  buscarClientePorCedula,
  buscarClientes
};