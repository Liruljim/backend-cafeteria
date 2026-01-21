const supabase = require('../config/supabaseClient');

/**
 * Obtiene la lista de clientes que tienen saldo pendiente > 0
 */
async function getClientesConSaldo(req, res) {
  try {
    const { data, error } = await supabase.rpc('get_clientes_con_saldo');
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('Error getClientesConSaldo:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Obtiene el historial detallado de créditos y pagos de un cliente
 */
async function getHistorialCliente(req, res) {
  const { cliente_id } = req.params;
  try {
    // 1. Obtener ventas a crédito (pendientes y pagadas) con sus productos
    const { data: ventas, error: ventasErr } = await supabase
      .from('creditos')
      .select(`
        id,
        monto_total,
        saldo_pendiente,
        estado,
        fecha_inicio,
        fecha_vencimiento,
        ventas (
          id,
          detalle_ventas (
            cantidad,
            precio_unitario,
            productos (nombre)
          )
        )
      `)
      .eq('cliente_id', cliente_id)
      .order('fecha_inicio', { ascending: false });

    if (ventasErr) throw ventasErr;

    // 2. Obtener historial de pagos
    const { data: pagos, error: pagosErr } = await supabase
      .from('pagos_credito')
      .select(`
        id,
        monto_pagado,
        fecha_pago,
        usuarios (nombre)
      `)
      .in('credito_id', ventas.map(v => v.id));

    if (pagosErr && ventas.length > 0) throw pagosErr;

    res.status(200).json({
      creditos: ventas,
      pagos: pagos || []
    });
  } catch (err) {
    console.error('Error getHistorialCliente:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Registra el pago total de la deuda de un cliente
 */
async function pagarDeudaTotal(req, res) {
  const { cliente_id, usuario_id } = req.body; // usuario_id es el ID del admin que procesa el pago

  if (!cliente_id || !usuario_id) {
    return res.status(400).json({ error: 'cliente_id y usuario_id son requeridos' });
  }

  try {
    const { error } = await supabase.rpc('registrar_pago_completo', {
      p_cliente_id: cliente_id,
      p_usuario_id: usuario_id
    });

    if (error) throw error;

    res.status(200).json({ message: 'Deuda saldada exitosamente' });
  } catch (err) {
    console.error('Error pagarDeudaTotal:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Registra un abono general que se distribuye entre los créditos pendientes (FIFO)
 */
async function registrarAbono(req, res) {
  const { cliente_id, monto, usuario_id } = req.body;

  if (!cliente_id || !monto || !usuario_id) {
    return res.status(400).json({ error: 'cliente_id, monto y usuario_id son requeridos' });
  }

  try {
    const { error } = await supabase.rpc('registrar_abono_general', {
      p_cliente_id: cliente_id,
      p_monto: monto,
      p_usuario_id: usuario_id
    });

    if (error) throw error;

    res.status(200).json({ message: 'Abono registrado exitosamente' });
  } catch (err) {
    console.error('Error registrarAbono:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getClientesConSaldo,
  getHistorialCliente,
  pagarDeudaTotal,
  registrarAbono
};
