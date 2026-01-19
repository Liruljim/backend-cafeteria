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
  const { data: newProd, error } = await supabase.from('productos').insert([productData]).select().single();
  if (error) throw error;

  // AUTO-CREATE Inventory for all floors (Requirement option A)
  const { data: floors } = await supabase.from('pisos').select('id');
  if (floors && floors.length > 0) {
    const inventoryRecords = floors.map(floor => ({
      producto_id: newProd.id,
      piso_id: floor.id,
      stock: 0
    }));
    await supabase.from('inventario').insert(inventoryRecords);
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

  const { data: updated, error } = await supabase.from('productos').update(productData).eq('id', id).select().single();
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
