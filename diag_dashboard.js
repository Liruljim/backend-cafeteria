const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/Soporte/Desktop/TAREA DE PROGRAMACION/MODULO 8/BACKEND-CAFETERIA/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugDashboard() {
    console.log('--- DASHBOARD DIAGNOSTIC ---');
    
    // Check sales table structure roughly
    const { data: sales, error: sErr } = await supabase.from('ventas').select('*, clientes(*)').limit(1);
    if (sErr) {
        console.log('Error fetching ventas with join:', sErr.message);
        const { data: salesNoJoin, error: sErr2 } = await supabase.from('ventas').select('*').limit(1);
        if (sErr2) console.log('Error fetching ventas simple:', sErr2.message);
        else console.log('Ventas simple SUCCESS. Columns:', Object.keys(salesNoJoin[0] || {}).join(', '));
    } else {
        console.log('Ventas join SUCCESS.');
    }

    // Check low stock
    const { data: lowStock, error: lsErr } = await supabase
        .from('inventario')
        .select('stock, productos!inner(tipo)')
        .eq('productos.tipo', 'stock')
        .lt('stock', 10);
    
    if (lsErr) console.log('Low Stock Error:', lsErr.message);
    else console.log('Low Stock Count:', lowStock.length);

    console.log('--- END DIAGNOSTIC ---');
}

debugDashboard();
