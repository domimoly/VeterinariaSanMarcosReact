const AUTH_URL = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:8082/api";

// Llama a ms-auth y traduce los errores a mensajes que el usuario pueda entender.
async function pedir(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${AUTH_URL}${ruta}`, {
      ...opciones,
      headers: { "Content-Type": "application/json", ...opciones.headers },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Inténtalo de nuevo en unos minutos.");
  }

  if (!respuesta.ok) {
    let cuerpo = {};
    try {
      cuerpo = await respuesta.json();
    } catch {
      // La respuesta de error no traía JSON: se usa el mensaje por defecto.
    }
    const error = new Error(cuerpo.mensaje ?? "No se pudo completar la solicitud.");
    error.estado = respuesta.status;
    error.errores = cuerpo.errores ?? {};
    throw error;
  }
  return respuesta.json();
}

export function login({ correo, password }) {
  return pedir("/auth/login", { method: "POST", body: JSON.stringify({ correo, password }) });
}

export function registrarTutor({ nombre, correo, password }) {
  return pedir("/auth/registro", { method: "POST", body: JSON.stringify({ nombre, correo, password }) });
}

// Pide un token nuevo con el token vigente (POST /api/auth/renovar).
export function renovarToken(token) {
  return pedir("/auth/renovar", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
}
