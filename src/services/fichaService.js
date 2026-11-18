import { solicitar } from "./http";

const FICHAS_URL = import.meta.env.VITE_FICHAS_API_URL ?? "http://localhost:8086/api";

// El frontend agrupa la ficha en tres listas; ms-fichas guarda cada registro con su "tipo".
export const TIPOS = { vacunas: "VACUNA", desparasitaciones: "DESPARASITACION", consultas: "CONSULTA" };
const LISTA_DE = { VACUNA: "vacunas", DESPARASITACION: "desparasitaciones", CONSULTA: "consultas" };

export const fichaVacia = { vacunas: [], desparasitaciones: [], consultas: [] };

// Traduce un registro de la API a la forma que usan los componentes de cada lista.
export function desdeApi(r) {
  if (r.tipo === "CONSULTA") {
    return {
      id: r.id,
      fecha: r.fecha,
      motivo: r.motivo ?? "",
      diagnostico: r.diagnostico ?? "",
      medicamentos: r.medicamentos ?? "Ninguno",
      veterinario: r.veterinario ?? "",
      proximoControl: r.proximoControl ?? "",
    };
  }
  return { id: r.id, nombre: r.nombre ?? "", fecha: r.fecha, proximaDosis: r.proximaDosis ?? "" };
}

// "lista" es "vacunas", "desparasitaciones" o "consultas"; "datos" lo que llena el formulario.
export function haciaApi(mascotaId, lista, datos) {
  const base = { mascotaId, tipo: TIPOS[lista], fecha: datos.fecha };
  if (lista === "consultas") {
    return {
      ...base,
      motivo: datos.motivo,
      diagnostico: datos.diagnostico,
      medicamentos: datos.medicamentos,
      veterinario: datos.veterinario,
      proximoControl: datos.proximoControl || null,
    };
  }
  return { ...base, nombre: datos.nombre, proximaDosis: datos.proximaDosis };
}

// Agrupa los registros de la API en las tres listas de la ficha (la API los entrega del más reciente al más antiguo).
export function agruparFicha(registros) {
  const ficha = { vacunas: [], desparasitaciones: [], consultas: [] };
  registros.forEach((r) => ficha[LISTA_DE[r.tipo]]?.push(desdeApi(r)));
  return ficha;
}

// Historial de una mascota. El tutor solo puede pedir el de las suyas; la recepción, el de cualquiera.
export async function listarFicha(mascotaId) {
  return agruparFicha(await solicitar(FICHAS_URL, `/fichas?mascotaId=${mascotaId}`));
}

export async function crearRegistro(mascotaId, lista, datos) {
  const creado = await solicitar(FICHAS_URL, "/fichas", {
    method: "POST",
    body: JSON.stringify(haciaApi(mascotaId, lista, datos)),
  });
  return desdeApi(creado);
}

export async function actualizarRegistro(id, mascotaId, lista, datos) {
  const editado = await solicitar(FICHAS_URL, `/fichas/${id}`, {
    method: "PUT",
    body: JSON.stringify(haciaApi(mascotaId, lista, datos)),
  });
  return desdeApi(editado);
}

export function eliminarRegistro(id) {
  return solicitar(FICHAS_URL, `/fichas/${id}`, { method: "DELETE" });
}
