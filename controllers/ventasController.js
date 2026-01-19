async function registrarVenta(req, res) {
  const { cliente_id, usuario_id, total, productos } = req.body;

  try {
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert([{ cliente_id, usuario_id, total, fecha_venta: new Date() }])
      .select()
      .single();

    if (ventaError) throw ventaError;

    const venta_id = venta.id;

    // Insertar detalle de productos
    const detalle = productos.map(p => ({
      venta_id,
      producto_id: p.producto_id,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario
    }));

    const { error: detalleError } = await supabase
      .from('detalle_ventas')
      .insert(detalle);

    if (detalleError) throw detalleError;

    // Actualizar stock SOLO si el producto es tipo "stock"
    for (const p of productos) {
      const { data: prod } = await supabase
        .from('productos')
        .select('tipo')
        .eq('id', p.producto_id)
        .single();

      if (prod.tipo === 'stock') {
        await supabase.rpc('fn_actualizar_stock', {
          producto_id: p.producto_id,
          cantidad: p.cantidad
        });
      }
    }

    res.status(200).json({ message: 'Venta registrada', venta_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}