import { solicitar } from "./http";

// La gestión de cuentas vive en ms-auth (mismo servicio del login), bajo /api/usuarios y solo para ADMINISTRADOR.
const AUTH_URL = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:8082/api";

export const ETIQUETAS_ROL = {
  TUTOR: "Tutor",
  RECEPCIONISTA: "Recepcionista",
  ADMINISTRADOR: "Administrador",
};

export function desdeApi(u) {
  return {
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.rol,
    activo: Boolean(u.activo),
    // La API entrega fecha y hora; la tabla solo muestra el día
    registro: u.creadoEn ? String(u.creadoEn).slice(0, 10) : "",
  };
}

export async function listarUsuarios() {
  const lista = await solicitar(AUTH_URL, "/usuarios");
  return lista.map(desdeApi);
}

export async function crearUsuario({ nombre, correo, password, rol }) {
  return desdeApi(
    await solicitar(AUTH_URL, "/usuarios", { method: "POST", body: JSON.stringify({ nombre, correo, password, rol }) })
  );
}

// El correo no se edita (es la identidad de la cuenta). Sin contraseña, esta no cambia.
export async function actualizarUsuario(id, { nombre, rol, password }) {
  const cuerpo = { nombre, rol };
  if (password) cuerpo.password = password;
  return desdeApi(await solicitar(AUTH_URL, `/usuarios/${id}`, { method: "PUT", body: JSON.stringify(cuerpo) }));
}

export async function cambiarEstadoUsuario(id, activo) {
  return desdeApi(await solicitar(AUTH_URL, `/usuarios/${id}/${activo ? "activar" : "desactivar"}`, { method: "PUT" }));
}
