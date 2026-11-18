// La sesión vive en sessionStorage: se borra al cerrar la pestaña (Guía 17).
// El navegador solo guarda el token y los datos para mostrar; la seguridad real
// la hace el backend, que valida el token en cada petición.
const CLAVE_TOKEN = "tokenVeterinariaSanMarcos";
const CLAVE_USUARIO = "sesionVeterinariaSanMarcos";

export const ROLES = {
  tutor: "TUTOR",
  recepcionista: "RECEPCIONISTA",
  administrador: "ADMINISTRADOR",
};

export function guardarSesion({ token, nombre, correo, rol }) {
  sessionStorage.setItem(CLAVE_TOKEN, token);
  sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify({ nombre, correo, rol }));
}

export function obtenerToken() {
  return sessionStorage.getItem(CLAVE_TOKEN);
}

// Devuelve { nombre, correo, rol } o null si no hay sesión válida.
export function obtenerUsuarioSesion() {
  try {
    const usuario = JSON.parse(sessionStorage.getItem(CLAVE_USUARIO));
    if (!usuario || typeof usuario.rol !== "string" || !obtenerToken()) return null;
    return usuario;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_TOKEN);
  sessionStorage.removeItem(CLAVE_USUARIO);
}

// Página a la que va cada rol después de iniciar sesión.
export function rutaInicialDelRol(rol) {
  if (rol === ROLES.administrador) return "/admin/usuarios";
  if (rol === ROLES.recepcionista) return "/recepcion";
  return "/mi-perfil";
}
