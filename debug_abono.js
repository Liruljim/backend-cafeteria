const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/Soporte/Desktop/TAREA DE PROGRAMACION/MODULO 8/BACKEND-CAFETERIA/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getCols() {
  const { data, error } = await supabase.rpc('get_table_columns_names', { t_name: 'pagos_credito' });
  if (error) {
     // If my generic rpc fails, use direct query to information_schema if possible (often blocked via postgrest)
     // Alternatively, try to insert a dummy and see the error message which often list missing columns
     console.log('RPC Error:', error.message);
     
     // Try direct query
     const { data: cols, error: err2 } = await supabase
        .from('pagos_credito')
        .select('*')
        .limit(1);
     
     if (err2) console.log('Select Error:', err2.message);
     else console.log('Select Result Keys:', data ? Object.keys(data[0] || {}) : 'no data');
  } else {
     console.log('Columns:', data);
  }
}

// Since I suspect the RPC might not even exist yet (user might have forgotten to run it), 
// let's try to test the RPC directly with a try-catch to see if it's a "function not found" error.
async function testRPC() {
    const { error } = await supabase.rpc('registrar_abono_general', {
        p_cliente_id: '00000000-0000-0000-0000-000000000000',
        p_monto: 0,
        p_usuario_id: '00000000-0000-0000-0000-000000000000'
    });
    if (error) {
        console.log('RPC Test result:', error.code, error.message);
    }
}

testRPC();
