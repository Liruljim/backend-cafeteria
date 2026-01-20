const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/Soporte/Desktop/TAREA DE PROGRAMACION/MODULO 8/BACKEND-CAFETERIA/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function simulate() {
  const { data: clients } = await supabase.from('creditos').select('cliente_id').eq('estado', 'pendiente').limit(1);
  const { data: users } = await supabase.from('usuarios').select('id').limit(1);

  if (!clients?.length || !users?.length) {
    console.log('No data found to simulate');
    return;
  }

  const cid = clients[0].cliente_id;
  const uid = users[0].id;

  console.log(`Simulating for Client: ${cid}, User: ${uid}`);

  const { error } = await supabase.rpc('registrar_abono_general', {
    p_cliente_id: cid,
    p_monto: 1.00,
    p_usuario_id: uid
  });

  if (error) {
    console.log('RPC ERROR CAUGHT:');
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    console.log('Details:', error.details);
    console.log('Hint:', error.hint);
  } else {
    console.log('RPC SUCCESS! (Wait, then why did the user get a 500?)');
  }
}

simulate();
