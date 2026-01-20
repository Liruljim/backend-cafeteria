const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/Soporte/Desktop/TAREA DE PROGRAMACION/MODULO 8/BACKEND-CAFETERIA/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  // Using a query that returns columns even if no data
  const { data, error } = await supabase.from('pagos_credito').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    // If table is empty, we might need a different approach. 
    // Usually Supabase select * on empty table still gives you the keys if you have data, 
    // but if not, we try to insert a dummy and rollback or delete.
    console.log('Sample Data:', data);
    
    // Fallback: use rpc if available or just check the code again.
    // I will try to fetch the first record of any table that has data to see the format.
  }
}

inspect();
