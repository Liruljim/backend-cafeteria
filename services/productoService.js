const supabase = require('../config/supabaseClient');

const getAllProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias!category_id(nombre), proveedores!proveedor_id(nombre)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const createProducto = async (productData) => {
  // Validate Provider belongs to Category
  const { data: prov, error: provErr } = await supabase
    .from('proveedores')
    .select('category_id')
    .eq('id', productData.proveedor_id)
    .single();

  if (provErr || !prov) throw new Error('Proveedor no encontrado');
  
  if (prov.category_id !== productData.category_id) {
    throw new Error('El proveedor no pertenece a la categoría seleccionada');
  }

  // Create Product
  const { piso_inicial_id, stock_inicial, ...cleanData } = productData;
  const productToInsert = {
    ...cleanData,
    tipo: productData.tipo || 'stock' // Default to stock if not provided
  };

  const { data: newProd, error } = await supabase.from('productos').insert([productToInsert]).select().single();
  if (error) throw error;

  // AUTO-CREATE Inventory for all floors
  const { data: floors } = await supabase.from('pisos').select('id, nombre');
  if (floors && floors.length > 0) {
    const uniqueFloorsByName = {};
    floors.forEach(f => {
        if (!uniqueFloorsByName[f.nombre.trim().toLowerCase()]) {
            uniqueFloorsByName[f.nombre.trim().toLowerCase()] = f.id;
        }
    });

    const uniqueFloorIds = Object.values(uniqueFloorsByName);
    
    for (const floorId of uniqueFloorIds) {
        // Determine initial stock for this floor
        let initialStock = 0;
        if (productData.piso_inicial_id === floorId) {
            initialStock = parseInt(productData.stock_inicial) || 0;
        }

        const { data: existing } = await supabase
            .from('inventario')
            .select('id')
            .eq('producto_id', newProd.id)
            .eq('piso_id', floorId)
            .single();
            
        if (!existing) {
            await supabase.from('inventario').insert({
                producto_id: newProd.id,
                piso_id: floorId,
                stock: initialStock
            });
        }
    }
  }

  return newProd;
};

const updateProducto = async (id, productData) => {
  // If changing category or provider, re-validate
  if (productData.proveedor_id || productData.category_id) {
     // Fetch current data if partial update, but assume full object usually passed or handle partials carefully. 
     // For simplicity, enforce passing both or validate what is passed.
     // Getting current product state is safer.
     const { data: currentProd } = await supabase.from('productos').select('*').eq('id', id).single();
     
     const targetProvId = productData.proveedor_id || currentProd.proveedor_id;
     const targetCatId = productData.category_id || currentProd.category_id;

     const { data: prov } = await supabase.from('proveedores').select('category_id').eq('id', targetProvId).single();
     
     if (!prov || prov.category_id !== targetCatId) {
        throw new Error('El proveedor no coincide con la categoría');
     }
  }

  const { piso_inicial_id, stock_inicial, ...cleanData } = productData;
  const { data: updated, error } = await supabase.from('productos').update(cleanData).eq('id', id).select().single();
  if (error) throw error;
  return updated;
};

const deleteProducto = async (id) => {
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = {
  getAllProductos,
  createProducto,
  updateProducto,
  deleteProducto
};
