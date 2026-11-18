import { solicitar } from "./http";
import { formatearPrecio } from "../utils/precios";

const CITAS_URL = import.meta.env.VITE_CITAS_API_URL ?? "http://localhost:8085/api";

function textoDuracion(minutos) {
  return minutos >= 1440 ? `${minutos / 60} h` : `${minutos} min`;
}

// La API entrega la cita con otros nombres y tipos (precio entero, hora HH:mm:ss, servicioCodigo).
// Aquí se traduce a la forma que usan los componentes.
export function desdeApi(c) {
  return {
    id: c.id,
    codigo: c.codigo,
    mascotaId: c.mascotaId,
    mascotaNombre: c.mascotaNombre,
    especie: c.mascotaEspecie ?? "",
    servicioId: c.servicioCodigo,
    servicioNombre: c.servicioNombre,
    duracion: textoDuracion(c.duracionMin),
    duracionMin: c.duracionMin,
    precio: formatearPrecio(c.precio ?? 0),
    fecha: c.fecha,
    hora: String(c.hora).slice(0, 5),
    observaciones: c.observaciones ?? "",
    tutor: {
      run: "",
      nombre: c.tutorNombre ?? c.tutorCorreo,
      apellidos: "",
      telefono: c.telefono ?? "",
      correo: c.correoContacto || c.tutorCorreo,
      medioRecordatorio: c.medioRecordatorio ?? "Correo",
    },
    tutorCorreo: c.tutorCorreo,
    estado: c.estado,
    nota: c.nota ?? "",
    creadaEn: c.creadaEn,
  };
}

// "solicitud" es lo que se arma en los pasos de AgendarCita: mascota, servicio, fecha, hora, tutor...
export function haciaApi(solicitud) {
  const { tutor } = solicitud;
  return {
    mascotaId: solicitud.mascota.id,
    servicioCodigo: solicitud.servicio.id,
    fecha: solicitud.fecha,
    hora: solicitud.hora,
    telefono: tutor.telefono,
    tutorNombre: `${tutor.nombre} ${tutor.apellidos}`.trim(),
    correoContacto: tutor.correo,
    medioRecordatorio: tutor.medioRecordatorio,
    observaciones: solicitud.observaciones,
  };
}

// El tutor recibe solo sus citas; la recepción recibe la agenda completa.
export async function listarCitas() {
  const lista = await solicitar(CITAS_URL, "/citas");
  return lista.map(desdeApi);
}

export async function crearCita(solicitud) {
  return desdeApi(await solicitar(CITAS_URL, "/citas", { method: "POST", body: JSON.stringify(haciaApi(solicitud)) }));
}

export async function confirmarCita(id) {
  return desdeApi(await solicitar(CITAS_URL, `/citas/${id}/confirmar`, { method: "PUT" }));
}

export async function reagendarCita(id, { fecha, hora, nota }) {
  return desdeApi(
    await solicitar(CITAS_URL, `/citas/${id}/reagendar`, { method: "PUT", body: JSON.stringify({ fecha, hora, nota }) })
  );
}

export async function cancelarCita(id) {
  return desdeApi(await solicitar(CITAS_URL, `/citas/${id}/cancelar`, { method: "PUT" }));
}

// Horas de inicio ("09:00", "09:30"...) con cupo libre para un servicio en una fecha.
export async function horasLibres(fecha, servicioId) {
  const consulta = new URLSearchParams({ fecha, servicio: servicioId });
  const horas = await solicitar(CITAS_URL, `/citas/disponibilidad?${consulta}`);
  return horas.map((hora) => String(hora).slice(0, 5));
}
