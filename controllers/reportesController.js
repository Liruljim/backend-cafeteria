const supabase = require('../config/supabaseClient');

async function getReporteVentas(req, res) {
  const { desde, hasta, cliente, piso, metodo } = req.query;

  try {
    let query = supabase
      .from('ventas')
      .select(`
        id,
        created_at, 
        fecha_venta, 
        metodo_pago, 
        tasa_cambio, 
        total_usd, 
        total_bs,
        clientes!cliente_id(nombre, apellido, cedula),
        pisos!piso_id(nombre),
        detalle_ventas (
          cantidad,
          precio_unitario,
          productos (nombre)
        )
      `)
      .order('created_at', { ascending: false });

    if (desde) query = query.gte('fecha_venta', `${desde}T00:00:00`); 
    if (hasta) query = query.lte('fecha_venta', `${hasta}T23:59:59`); 

    if (metodo) query = query.eq('metodo_pago', metodo);
    
    if (piso) query = query.eq('piso_id', piso);

    const { data, error } = await query;
    if (error) throw error;
    
    let filteredData = data;
    if (cliente) {
        const q = cliente.toLowerCase();
        filteredData = data.filter(v => {
            const c = v.clientes;
            if (!c) return false;
            return (
                (c.nombre && c.nombre.toLowerCase().includes(q)) ||
                (c.apellido && c.apellido.toLowerCase().includes(q)) ||
                (c.cedula && c.cedula.includes(q))
            );
        });
    }

    res.status(200).json(filteredData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function getReportePagos(req, res) {
  const { desde, hasta, cliente } = req.query;

  try {
    let query = supabase
      .from('pagos_credito')
      .select(`
        id,
        monto_pagado,
        fecha_pago,
        usuarios (nombre),
        creditos (
            clientes (nombre, apellido, cedula)
        )
      `)
      .order('fecha_pago', { ascending: false });

    if (desde) query = query.gte('fecha_pago', `${desde}T00:00:00`); 
    if (hasta) query = query.lte('fecha_pago', `${hasta}T23:59:59`); 

    const { data, error } = await query;
    if (error) throw error;

    let filteredData = data;
    if (cliente) {
        const q = cliente.toLowerCase();
        filteredData = data.filter(p => {
            const c = p.creditos?.clientes;
            if (!c) return false;
            return (
                (c.nombre && c.nombre.toLowerCase().includes(q)) ||
                (c.apellido && c.apellido.toLowerCase().includes(q)) ||
                (c.cedula && c.cedula.includes(q))
            );
        });
    }

    res.status(200).json(filteredData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getReporteVentas,
  getReportePagos
};
