const supabase = require('../utils/supabaseClient');

// Registrar usuario (Admin-like via signUp)
async function registrarUsuario(req, res) {
  const { email, password, nombre, rol } = req.body;

  if (!email || !password || !rol) {
    return res.status(400).json({ error: 'Email, contraseña y rol son obligatorios' });
  }

  try {
    // 1. Crear usuario en Auth (usando signUp porque no hay service_role)
    // NOTA: Para que esto funcione sin error de email, el usuario DEBE desactivar 
    // "Confirm Email" en el panel de Supabase (Authentication -> Providers -> Email)
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
       // Si el error es "Email address invalid", es por la configuración de Supabase
       if (authError.message.includes("invalid") && authError.message.includes("Email")) {
         return res.status(400).json({ 
           error: 'Configuración necesaria', 
           message: 'Para registrar usuarios desde el backend sin la clave service_role, debes desactivar "Confirm Email" en el panel de Supabase (Authentication -> Providers -> Email).' 
         });
       }
       throw authError;
    }

    if (!authUser.user) throw new Error('No se pudo crear el usuario en Auth');

    // 2. Guardar en tabla usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .insert([{ 
        auth_id: authUser.user.id, 
        nombre, 
        email, 
        rol 
      }]);

    if (userError) {
      // Intentar limpiar si falla insert (aunque sin service_role esto fallará tmb)
      try { await supabase.auth.admin.deleteUser(authUser.user.id); } catch(e){}
      throw userError;
    }

    res.status(201).json({ message: 'Usuario registrado exitosamente', user: authUser.user });
  } catch (err) {
    console.error('Error creando usuario:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar usuarios
async function listarUsuarios(req, res) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, auth_id, nombre, email, rol, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Obtener un usuario por ID
async function obtenerUsuario(req, res) {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
}

// Actualizar usuario (Híbrido)
async function actualizarUsuario(req, res) {
  const { id } = req.params;
  const { nombre, rol, email, password } = req.body;

  try {
    // 1. Obtener usuario para tener su auth_id
    const { data: currentUser, error: fetchError } = await supabase
      .from('usuarios')
      .select('auth_id')
      .eq('id', id)
      .single();

    if (fetchError || !currentUser) throw new Error('Usuario no encontrado');

    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (rol !== undefined) updates.rol = rol;
    if (email !== undefined) updates.email = email;

    // 2. Actualizar tabla usuarios (esto siempre funciona con anon key si RLS permite)
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id);
      if (updateError) throw updateError;
    }

    // 3. Intentar actualizar Auth (solo funcionará con service_code)
    const authUpdates = {};
    if (password && password.trim() !== '') authUpdates.password = password;
    if (email) authUpdates.email = email;

    if (Object.keys(authUpdates).length > 0) {
      try {
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
          currentUser.auth_id,
          authUpdates
        );
        // Si falla por permisos, no detenemos el proceso pero informamos
        if (authUpdateError) {
          console.warn('No se pudo actualizar Auth (posible falta de service_role):', authUpdateError.message);
        }
      } catch (e) {
        console.warn('Error capturado al intentar actualizar Auth:', e.message);
      }
    }

    res.status(200).json({ 
      message: 'Usuario actualizado exitosamente en la base de datos local.',
      warning: 'Nota: Si no se usó la clave service_role, la contraseña y el email en el login de Supabase no cambiaron.'
    });
  } catch (err) {
    console.error('Error actualizando usuario:', err);
    res.status(500).json({ error: err.message });
  }
}

// Eliminar usuario
async function eliminarUsuario(req, res) {
  const { id } = req.params;

  try {
    // 1. Obtener auth_id
    const { data: user, error: fetchError } = await supabase
       .from('usuarios')
       .select('auth_id')
       .eq('id', id)
       .single();

    if (fetchError) throw new Error('Usuario no encontrado');

    // 2. Intentar eliminar de Auth (solo funcionará con service_role)
    try {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.auth_id);
      if (authDeleteError) console.warn('No se pudo borrar de Auth:', authDeleteError.message);
    } catch (e) {
      console.warn('Error al intentar borrar de Auth:', e.message);
    }

    // 3. Eliminar de tabla usuarios (esto es lo que cuenta para el panel)
    const { error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;

    res.status(200).json({ 
      message: 'Usuario eliminado del sistema local.',
      warning: 'Nota: El acceso a Supabase Auth permanece activo si no se usó la clave service_role.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  registrarUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario
};