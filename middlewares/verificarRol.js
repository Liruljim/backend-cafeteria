const supabase = require('../config/supabaseClient');

function verificarRol(rolesPermitidos) {
  return async (req, res, next) => {
    try {
      // 1. Obtener token del header
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
      }

      // 2. Validar token con Supabase
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        // Si el token expiró, devolver un error estándar para que el front lo maneje
        const msg = error?.message || '';
        if (/expired|token is expired|token expired|invalid jwt/i.test(msg)) {
          return res.status(401).json({ error: 'token_expired', message: 'Token expirado' });
        }
        return res.status(401).json({ error: 'Token inválido' });
      }

      const usuarioAuth = data.user; // ✅ nombre claro

      // 3. Buscar rol en tabla usuarios
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('id, rol')
        .eq('auth_id', usuarioAuth.id)
        .single();

      if (userError || !usuario) {
        return res.status(403).json({ error: 'Usuario no registrado en la tabla usuarios' });
      }

      // 4. Validar rol
      if (!rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
      }

      // 5. Guardar usuario en request
      req.user = usuario;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  
}

module.exports = verificarRol;