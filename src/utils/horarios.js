// src/utils/horarios.js
import { agendamiento, horarioAtencion } from "../data/clinica";
import { fechaIsoLocal } from "./fechas";

const { bloqueMin, cuposPorBloque, semanasMaximas, anticipacionMin } = agendamiento;
const NOMBRES_DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function aMinutos(hora) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

function aHora(minutos) {
  const horas = String(Math.floor(minutos / 60)).padStart(2, "0");
  const resto = String(minutos % 60).padStart(2, "0");
  return `${horas}:${resto}`;
}

function fechaDesdeIso(fechaIso) {
  return new Date(`${fechaIso}T00:00:00`);
}

function lunesDeLaSemana(fecha) {
  const lunes = new Date(fecha);
  lunes.setHours(0, 0, 0, 0);
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  return lunes;
}

// Cuántos bloques de 30 min ocupa un servicio (uno de 5 minutos igual reserva un bloque)
export function bloquesNecesarios(duracionMin) {
  return Math.ceil(duracionMin / bloqueMin);
}

// Lunes a sábado de la semana pedida (0 = esta semana, 1 = la próxima...)
export function diasDeLaSemana(offsetSemanas) {
  const lunes = lunesDeLaSemana(new Date());
  lunes.setDate(lunes.getDate() + offsetSemanas * 7);
  return Array.from({ length: 6 }, (_, indice) => {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + indice);
    return fechaIsoLocal(dia);
  });
}

export function semanaDeFecha(fechaIso) {
  const diferencia = lunesDeLaSemana(fechaDesdeIso(fechaIso)) - lunesDeLaSemana(new Date());
  return Math.round(diferencia / (7 * 86400000));
}

export function etiquetaDia(fechaIso) {
  const fecha = fechaDesdeIso(fechaIso);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return { nombre: NOMBRES_DIA[fecha.getDay()], fechaCorta: `${dia}/${mes}` };
}

// Cupos ya tomados en un bloque. Sin backend: una parte se simula de forma fija
// según el día y la hora, y otra viene de las citas que el usuario ya guardó.
function cuposOcupados(fechaIso, inicioMin, citasGuardadas) {
  const dia = Number(fechaIso.slice(8, 10));
  const semilla = (dia * 5 + (inicioMin / bloqueMin) * 3) % 11;
  let simulados = 0;
  if (semilla >= 9) simulados = cuposPorBloque;
  else if (semilla >= 7) simulados = 2;
  else if (semilla >= 5) simulados = 1;

  const reales = citasGuardadas.filter((cita) => {
    if (cita.fecha !== fechaIso || cita.estado === "Cancelada") return false;
    const desde = aMinutos(cita.hora);
    return inicioMin >= desde && inicioMin < desde + bloquesNecesarios(cita.duracionMin) * bloqueMin;
  }).length;

  return simulados + reales;
}

function estaDisponible(fechaIso, inicioMin, duracionMin, citasGuardadas, ahora) {
  const inicio = fechaDesdeIso(fechaIso);
  inicio.setMinutes(inicioMin);
  if (inicio - ahora < anticipacionMin * 60000) return false;

  for (let bloque = 0; bloque < bloquesNecesarios(duracionMin); bloque++) {
    if (cuposOcupados(fechaIso, inicioMin + bloque * bloqueMin, citasGuardadas) >= cuposPorBloque) {
      return false;
    }
  }
  return true;
}

// Horas de inicio posibles de un día: el servicio debe terminar antes del cierre de su tramo
export function horasDelDia(fechaIso, duracionMin, citasGuardadas, ahora = new Date()) {
  const tramos = horarioAtencion[fechaDesdeIso(fechaIso).getDay()];
  const largo = bloquesNecesarios(duracionMin) * bloqueMin;
  const horas = [];

  tramos.forEach(([desde, hasta]) => {
    for (let inicio = aMinutos(desde); inicio + largo <= aMinutos(hasta); inicio += bloqueMin) {
      horas.push({
        hora: aHora(inicio),
        disponible: estaDisponible(fechaIso, inicio, duracionMin, citasGuardadas, ahora),
      });
    }
  });
  return horas;
}

// Devuelve un objeto con los errores de fecha y hora ({} si todo está bien)
export function validarHorario({ fecha, hora, duracionMin, citasGuardadas, mascotaId, ahora = new Date() }) {
  const errores = {};

  if (!fecha) {
    errores.fecha = "Selecciona un día";
  } else if (horarioAtencion[fechaDesdeIso(fecha).getDay()].length === 0) {
    errores.fecha = "La clínica no atiende ese día";
  } else if (fecha < fechaIsoLocal(ahora)) {
    errores.fecha = "No puedes elegir una fecha pasada";
  } else if (semanaDeFecha(fecha) > semanasMaximas - 1) {
    errores.fecha = `Solo puedes agendar con hasta ${semanasMaximas} semanas de anticipación`;
  } else if (
    citasGuardadas.some((cita) => cita.mascotaId === mascotaId && cita.fecha === fecha && cita.estado !== "Cancelada")
  ) {
    errores.fecha = "Tu mascota ya tiene una cita ese día";
  }

  if (!hora) {
    errores.hora = "Selecciona una hora";
  } else if (!errores.fecha) {
    const opcion = horasDelDia(fecha, duracionMin, citasGuardadas, ahora).find((h) => h.hora === hora);
    if (!opcion || !opcion.disponible) errores.hora = "Esa hora ya no está disponible, elige otra";
  }

  return errores;
}