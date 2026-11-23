import { solicitar } from "./http";

const AUTH_URL = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:8082/api";

// Los datos personales viven en ms-auth (tabla usuarios). Las etiquetas de rol son las que muestra el encabezado.
const ETIQUETAS = { TUTOR: "Dueño de mascota", RECEPCIONISTA: "Recepcionista", ADMINISTRADOR: "Administrador" };

export function desdeApi(p) {
  return {
    run: p.run ?? "",
    nombre: p.nombre,
    apellidos: p.apellidos ?? "",
    fechaNacimiento: p.fechaNacimiento ?? "",
    telefono: p.telefono ?? "",
    region: p.region ?? "",
    comuna: p.comuna ?? "",
    direccion: p.direccion ?? "",
    correo: p.correo,
    rol: ETIQUETAS[p.rol] ?? p.rol,
  };
}

// El correo y el rol no se envían: la cuenta se identifica con el token.
export function haciaApi(datos) {
  return {
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    run: datos.run || null,
    fechaNacimiento: datos.fechaNacimiento,
    telefono: datos.telefono,
    region: datos.region,
    comuna: datos.comuna,
    direccion: datos.direccion,
  };
}

export async function obtenerPerfil() {
  return desdeApi(await solicitar(AUTH_URL, "/auth/perfil"));
}

export async function guardarPerfil(datos) {
  return desdeApi(await solicitar(AUTH_URL, "/auth/perfil", { method: "PUT", body: JSON.stringify(haciaApi(datos)) }));
}
