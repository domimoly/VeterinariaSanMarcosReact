import { cerrarSesion, obtenerToken } from "../utils/sesion";

// Petición a un microservicio: agrega el token de la sesión y traduce los errores.
// Los microservicios responden los errores como { error } o { mensaje }.
export async function solicitar(baseUrl, ruta, opciones = {}) {
  const headers = { "Content-Type": "application/json", ...opciones.headers };
  const token = obtenerToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${baseUrl}${ruta}`, { ...opciones, headers });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Inténtalo de nuevo en unos minutos.");
  }

  if (respuesta.status === 401) {
    // Token vencido o inválido: se limpia la sesión y la página decide a dónde llevar al usuario.
    cerrarSesion();
    const error = new Error("Tu sesión venció. Inicia sesión nuevamente.");
    error.estado = 401;
    throw error;
  }

  if (!respuesta.ok) {
    let cuerpo = {};
    try {
      cuerpo = await respuesta.json();
    } catch {
      // La respuesta de error no traía JSON: se usa el mensaje por defecto.
    }
    const error = new Error(cuerpo.error ?? cuerpo.mensaje ?? "No se pudo completar la solicitud.");
    error.estado = respuesta.status;
    throw error;
  }

  return respuesta.status === 204 ? null : respuesta.json();
}
