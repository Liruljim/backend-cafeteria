const supabase = require('../config/supabaseClient');
const { getTasaActual } = require('./tasaController'); 

async function getProductosPorPiso(req, res) {
  const { piso_id } = req.query;

  if (!piso_id) {
    return res.status(400).json({ error: 'piso_id es requerido' });
  }

  try {
    const { data, error } = await supabase
      .from('inventario')
      .select('stock, producto_id, productos!inner(id, nombre, sku, precio, tipo, categorias!category_id(nombre))')
      .eq('piso_id', piso_id)
      .or('stock.gt.0,productos.tipo.neq.stock');

    if (error) throw error;

    const productos = data.map(item => ({
      id: item.productos.id,
      nombre: item.productos.nombre,
      sku: item.productos.sku,
      precio: item.productos.precio,
      categoria: item.productos.categorias?.nombre,
      stock: item.stock
    }));

    res.status(200).json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function registrarVenta(req, res) {
  const { cliente_id, piso_id, metodo_pago, items, total, observacion } = req.body;

  if (!cliente_id || !piso_id || !metodo_pago || !items || items.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos para la venta' });
  }

  try {
    const { data: tasaData, error: tasaErr } = await supabase
        .from('tasas')
        .select('tasa')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    const tasa = tasaData ? parseFloat(tasaData.tasa) : 1; 

    const total_usd = parseFloat(total); 
    const total_bs = total_usd * tasa;

    const { data: rpcData, error: rpcError } = await supabase
      .rpc('registrar_venta', {
        p_cliente_id: cliente_id,
        p_piso_id: piso_id,
        p_metodo_pago: metodo_pago,
        p_total: total_usd, 
        p_observacion: observacion || '',
        p_items: items 
      });

    if (rpcError) throw rpcError;

    const ventaId = rpcData.venta_id || rpcData; 

    const { error: updateErr } = await supabase
        .from('ventas')
        .update({
            tasa_cambio: tasa,
            total_usd: total_usd,
            total_bs: total_bs
        })
        .eq('id', ventaId);

    if (updateErr) console.error('Error actualizando montos de venta:', updateErr);

    res.status(201).json({ 
        message: 'Venta registrada exitosamente',
        venta_id: ventaId,
        tasa_aplicada: tasa,
        total_usd: total_usd.toFixed(2),
        total_bs: total_bs.toFixed(2)
    });

  } catch (err) {
    console.error('Error venta:', err);
    res.status(500).json({ error: err.message || 'Error al procesar la venta' });
  }
}

module.exports = {
  getProductosPorPiso,
  registrarVenta
};
