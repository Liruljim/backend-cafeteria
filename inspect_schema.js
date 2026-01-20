const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/Soporte/Desktop/TAREA DE PROGRAMACION/MODULO 8/BACKEND-CAFETERIA/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  // Querying information_schema.columns directly via PostgREST is often blocked.
  // But let's try a different approach: check the RPC definition if I can, 
  // or use a broader select if there's any data.
  // Since there's NO data, let's try to fetch a row from creditos and see its columns too.
  
  console.log('--- CREDITOS COLUMNS ---');
  const { data: cData, error: cErr } = await supabase.from('creditos').select('*').limit(1);
  if (cData && cData.length > 0) console.log(Object.keys(cData[0]));
  else console.log('No data in creditos');

  console.log('--- PAGOS_CREDITO COLUMNS (Attempt via error) ---');
  const { error: pErr } = await supabase.from('pagos_credito').insert({ garbage_col: 1 });
  if (pErr) {
      console.log('Error message contains hints:', pErr.message);
  }
}

inspect();
