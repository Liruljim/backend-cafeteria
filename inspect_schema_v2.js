const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/Soporte/Desktop/TAREA DE PROGRAMACION/MODULO 8/BACKEND-CAFETERIA/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  console.log('--- SCHEMA INSPECTION ---');
  
  const { data: prodData, error: prodErr } = await supabase.from('productos').select('*').limit(1);
  if (prodErr) console.error('Productos Error:', prodErr);
  else console.log('Productos Columns:', Object.keys(prodData[0] || {}));

  const { data: invData, error: invErr } = await supabase.from('inventario').select('*').limit(1);
  if (invErr) console.error('Inventario Error:', invErr);
  else console.log('Inventario Columns:', Object.keys(invData[0] || {}));

  console.log('--- END INSPECTION ---');
}

inspect();
