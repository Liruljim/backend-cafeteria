const supabase = require('../config/supabaseClient');

async function registrarUsuario(req, res) {
  try {
    const { email, password, nombre, rol } = req.body;

    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) {
      if (authError.message.includes("invalid") && authError.message.includes("Email")) {
        return res.status(400).json({ 
          error: 'Configuración de Supabase requerida', 
          message: 'Para registrar usuarios con la clave anon, debes desactivar "Confirm Email" en el panel de Supabase (Authentication -> Providers -> Email).' 
        });
      }
      throw authError;
    }

    if (!authUser.user) throw new Error('No se pudo crear el usuario en Auth');

    const { error: userError } = await supabase
      .from('usuarios')
      .insert([{ auth_id: authUser.user.id, nombre, email, rol }]);

    if (userError) throw userError;

    res.status(201).json({ message: 'Usuario registrado exitosamente', user: authUser.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


async function login(req, res) {
  const { email, password } = req.body;

  try { 
       const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  const user = data.user;
  const { data: usuarioDB, error: errorUsuario } = await supabase
    .from("usuarios")
    .select("id, rol, nombre")
    .eq("auth_id", user.id)
    .single();

  if (errorUsuario) return res.status(400).json({ error: errorUsuario.message });

  res.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: {
      id: usuarioDB.id,
      email: user.email,
      rol: usuarioDB.rol,
      nombre: usuarioDB.nombre
    }
  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function logout(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const { error } = await supabase.auth.admin.signOut(token);
    if (error) throw error;

    res.status(200).json({ message: 'Logout exitoso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function eliminarUsuario(req, res) {
    const { id } = req.params;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Usuario eliminado' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}

async function me(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      const msg = error.message || '';
      if (/expired|token is expired|token expired|invalid jwt/i.test(msg)) {
        return res.status(401).json({ error: 'token_expired', message: 'Token expirado' });
      }
      return res.status(400).json({ error: error.message });
    }

     const { data: usuarioDB, error: errorUsuario } = await supabase
    .from("usuarios")
    .select("rol, nombre")
    .eq("auth_id", data.user.id)
    .single();

    if (errorUsuario) return res.status(400).json({ error: errorUsuario.message });

    data.user.rol = usuarioDB.rol;
    data.user.nombre = usuarioDB.nombre;

    res.status(200).json(data.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  login,
  logout,
  registrarUsuario,
  eliminarUsuario,
  me
};