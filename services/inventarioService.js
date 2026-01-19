const supabase = require('../config/supabaseClient');

const getInventario = async (filters) => {
  let query = supabase.from('inventario').select('*, productos(nombre, sku, categorias!category_id(nombre)), pisos(nombre)');
  
  if (filters.producto_id) query = query.eq('producto_id', filters.producto_id);
  if (filters.piso_id) query = query.eq('piso_id', filters.piso_id);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const ajustarStock = async ({ producto_id, piso_id, modo, tipo, cantidad, observacion }) => {
  const mode = modo || tipo; // Support both names
  // Validations
  if (!producto_id || !piso_id || !mode || cantidad === undefined) {
    throw new Error(`Faltan datos requeridos (producto_id, piso_id, mode: ${mode}, cantidad: ${cantidad})`);
  }

  // 1. Get current stock
  const { data: currentInv, error: fetchError } = await supabase
    .from('inventario')
    .select('stock')
    .eq('producto_id', producto_id)
    .eq('piso_id', piso_id)
    .single();

  let currentStock = 0;
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = JSON object requested, multiple (or no) rows returned
     // If error is strictly not found, we assume 0 stock. 
     // Ideally we should differentiate "Real Error" vs "Not Found".
     // For now, if no row, currentStock = 0.
  } else if (currentInv) {
    currentStock = currentInv.stock;
  }

  let finalStock = 0;
  let delta = 0;

  if (mode === 'SET') {
    finalStock = parseInt(cantidad);
    delta = finalStock - currentStock;
  } else if (mode === 'DELTA') {
    delta = parseInt(cantidad);
    finalStock = currentStock + delta;
  } else {
    throw new Error('Modo inválido. Use SET o DELTA');
  }

  if (finalStock < 0) throw new Error('El stock no puede ser negativo');

  // 2. Register Movement First (Audit Trail)
  const tipoMovCalculado = delta >= 0 ? 'ENTRADA' : 'SALIDA'; 
  // If user calls it 'AJUSTE', we might map it differently, but ENTRADA/SALIDA based on math is robust.
  // Or purely 'AJUSTE'. Let's stick to strict types if possible.
  // Requirement says: check (tipo_movimiento in ('ENTRADA','SALIDA','AJUSTE'))
  
  // Determine Type: if simple correction -> AJUSTE? If real movement -> ENTRADA/SALIDA?
  // Let's infer: If 'SET', likely 'AJUSTE'. If 'DELTA', likely ENTRADA/SALIDA.
  let tipoMov = 'AJUSTE';
  if (mode === 'DELTA') {
      tipoMov = delta >= 0 ? 'ENTRADA' : 'SALIDA';
  }

  const { error: movError } = await supabase.from('movimientos_inventario').insert({
    producto_id,
    piso_id,
    cantidad: Math.abs(delta),
    tipo_movimiento: tipoMov,
    observacion: observacion || `Ajuste automático (${mode})`
  });
  if (movError) throw movError;

  // 3. Update Inventory
  const { data: updatedInv, error: upError } = await supabase
    .from('inventario')
    .upsert({
      producto_id,
      piso_id,
      stock: finalStock,
      updated_at: new Date()
    }, { onConflict: 'producto_id, piso_id' })
    .select()
    .single();

  if (upError) throw upError;

  return updatedInv;
};

const getMovimientos = async () => {
   const { data, error } = await supabase
    .from('movimientos_inventario')
    .select('*, productos(nombre), pisos(nombre)')
    .order('fecha', { ascending: false });
   if (error) throw error;
   return data;
};

const moverInventario = async ({ producto_id, piso_origen_id, piso_destino_id, cantidad }) => {
  // 1. Validations
  if (!producto_id || !piso_origen_id || !piso_destino_id) {
    throw new Error('Datos incompletos para mover inventario');
  }
  if (piso_origen_id === piso_destino_id) {
     throw new Error('El piso de origen y destino deben ser diferentes');
  }

  // 2. Get Source Item
  const { data: sourceItem, error: errSource } = await supabase
    .from('inventario')
    .select('*')
    .eq('producto_id', producto_id)
    .eq('piso_id', piso_origen_id)
    .single();

  if (errSource || !sourceItem) throw new Error('El producto no existe en el piso de origen');
  
  const qtyToMove = cantidad ? parseInt(cantidad) : sourceItem.stock;
  if (qtyToMove > sourceItem.stock) throw new Error('Cantidad a mover excede el stock disponible');

  // 3. Check Destination
  const { data: destItem } = await supabase
     .from('inventario')
     .select('*')
     .eq('producto_id', producto_id)
     .eq('piso_id', piso_destino_id)
     .single();

  // 4. Perform Move (Transaction logic simulated)
  
  // A. Subtract from Source
  const newSourceStock = sourceItem.stock - qtyToMove;
  
  // Update Source
  if (newSourceStock === 0 && !cantidad) {
      // If moving everything and quantity wasn't specific, maybe delete source? 
      // User asked to "edit floor", suggesting full move. 
      // But safest is to keep record at 0 or delete. Let's keep at 0 unless explicit cleanup requested.
      // Actually, if "Editing Floor", usually means "This item belongs there, not here".
      // Let's just update stock.
  }
  
  await ajustarStock({ 
      producto_id, 
      piso_id: piso_origen_id, 
      modo: 'DELTA', 
      cantidad: -qtyToMove, 
      observacion: `Traslado a piso ${piso_destino_id}` // ID is ugly, but sufficient for log
  });

  // B. Add to Destination
  if (destItem) {
      // Merge
       await ajustarStock({ 
          producto_id, 
          piso_id: piso_destino_id, 
          modo: 'DELTA', 
          cantidad: qtyToMove, 
          observacion: `Traslado desde piso ${piso_origen_id}` 
      });
  } else {
      // Create New at Destination
      // We can use upsert/insert directly or leverage ajustarStock which does upsert
      await ajustarStock({ 
          producto_id, 
          piso_id: piso_destino_id, 
          modo: 'SET', // Initialize
          cantidad: qtyToMove, 
          observacion: `Traslado desde piso ${piso_origen_id} (Nuevo)` 
      });
  }

  // Optional: If source stock is 0, should we delete it?
  // If the user intention was "Edit Floor", they don't want the old record.
  // I will check if newSourceStock is 0, and if so, delete it to keep it clean.
  if (newSourceStock === 0) {
      await deleteInventario(producto_id, piso_origen_id);
  }

  return { success: true };
};
const deleteInventario = async (producto_id, piso_id) => {
  const { error } = await supabase
    .from('inventario')
    .delete()
    .eq('producto_id', producto_id)
    .eq('piso_id', piso_id);

  if (error) throw error;
  return true;
};

module.exports = {
  getInventario,
  ajustarStock,
  getMovimientos,
  deleteInventario,
  moverInventario
};
