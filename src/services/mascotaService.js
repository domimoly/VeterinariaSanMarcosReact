import { solicitar } from "./http";

const MASCOTAS_URL = import.meta.env.VITE_MASCOTAS_API_URL ?? "http://localhost:8084/api";

// La API usa pesoKg/esterilizada; los formularios del frontend usan peso/esterilizado.
export function desdeApi(m) {
  return {
    id: m.id,
    nombre: m.nombre,
    especie: m.especie,
    raza: m.raza ?? "",
    sexo: m.sexo,
    fechaNacimiento: m.fechaNacimiento ?? "",
    peso: m.pesoKg,
    esterilizado: Boolean(m.esterilizada),
    observaciones: m.observaciones ?? "",
    tutorCorreo: m.tutorCorreo,
  };
}

export function haciaApi(datos) {
  return {
    nombre: datos.nombre,
    especie: datos.especie,
    raza: datos.raza,
    sexo: datos.sexo,
    pesoKg: Number(datos.peso),
    fechaNacimiento: datos.fechaNacimiento || null,
    esterilizada: Boolean(datos.esterilizado),
    observaciones: datos.observaciones,
  };
}

// El tutor recibe solo las suyas; la recepción recibe todas.
export async function listarMascotas() {
  const lista = await solicitar(MASCOTAS_URL, "/mascotas");
  return lista.map(desdeApi);
}

export async function crearMascota(datos) {
  return desdeApi(await solicitar(MASCOTAS_URL, "/mascotas", { method: "POST", body: JSON.stringify(haciaApi(datos)) }));
}

export async function actualizarMascota(id, datos) {
  return desdeApi(
    await solicitar(MASCOTAS_URL, `/mascotas/${id}`, { method: "PUT", body: JSON.stringify(haciaApi(datos)) })
  );
}

export function eliminarMascota(id) {
  return solicitar(MASCOTAS_URL, `/mascotas/${id}`, { method: "DELETE" });
}
