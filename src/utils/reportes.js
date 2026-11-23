// Arma los números del reporte del administrador a partir de las listas que entregan los microservicios.

function contar(lista, clave) {
  const conteo = new Map();
  lista.forEach((elemento) => {
    const valor = clave(elemento) || "Sin dato";
    conteo.set(valor, (conteo.get(valor) ?? 0) + 1);
  });
  return [...conteo.entries()].map(([nombre, total]) => ({ nombre, total }));
}

const porTotalDesc = (a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre);
const porNombreAsc = (a, b) => a.nombre.localeCompare(b.nombre);

export const ESTADOS_CITA = ["Pendiente", "Confirmada", "Reagendada", "Cancelada"];

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// "2026-11" -> "Noviembre 2026"
export function nombreMes(anioMes) {
  const [anio, mes] = anioMes.split("-");
  return `${MESES[Number(mes) - 1] ?? anioMes} ${anio}`;
}

// Las fechas llegan como AAAA-MM-DD, así que se pueden comparar como texto. Un límite vacío no limita.
export function estaEnPeriodo(fechaIso, desde, hasta) {
  if (!desde && !hasta) return true;
  if (!fechaIso) return false;
  if (desde && fechaIso < desde) return false;
  if (hasta && fechaIso > hasta) return false;
  return true;
}

// Cuenta por mes (AAAA-MM) solo lo que tiene fecha, de más antiguo a más reciente
const porMes = (lista, fecha) => contar(lista.filter((e) => fecha(e)), (e) => fecha(e).slice(0, 7)).sort(porNombreAsc);

export function resumirReportes({ usuarios, citas, mascotas, desde = "", hasta = "" }) {
  // El período filtra lo que ocurre en el tiempo (citas y pacientes nuevos); cuentas y mascotas se cuentan completas
  const citasPeriodo = citas.filter((c) => estaEnPeriodo(c.fecha, desde, hasta));
  const nuevas = mascotas.filter((m) => estaEnPeriodo(m.registradaEn, desde, hasta));
  const estados = ESTADOS_CITA.map((nombre) => ({ nombre, total: citasPeriodo.filter((c) => c.estado === nombre).length }));
  // Las canceladas no cuentan como demanda real de un servicio
  const vigentes = citasPeriodo.filter((c) => c.estado !== "Cancelada");

  return {
    totales: {
      usuarios: usuarios.length,
      usuariosActivos: usuarios.filter((u) => u.activo).length,
      mascotas: mascotas.length,
      citas: citasPeriodo.length,
      citasPendientes: estados[0].total,
      pacientesNuevos: nuevas.length,
    },
    citasPeriodo,
    citasPorEstado: estados,
    citasPorMes: porMes(vigentes, (c) => c.fecha),
    pacientesNuevosPorMes: porMes(nuevas, (m) => m.registradaEn),
    serviciosMasSolicitados: contar(vigentes, (c) => c.servicioNombre).sort(porTotalDesc).slice(0, 5),
    usuariosPorRol: contar(usuarios, (u) => u.rol).sort(porTotalDesc),
    mascotasPorEspecie: contar(mascotas, (m) => m.especie).sort(porTotalDesc),
  };
}

const COLUMNAS_CSV = ["Código", "Fecha", "Hora", "Mascota", "Especie", "Servicio", "Tutor", "Estado"];

const celdaCsv = (valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`;

// Atenciones del período en CSV (separado por punto y coma, que es lo que Excel en español abre bien)
export function citasACsv(citas) {
  const filas = citas.map((c) => [c.codigo, c.fecha, c.hora, c.mascotaNombre, c.especie, c.servicioNombre, c.tutor?.nombre ?? c.tutorCorreo, c.estado]);
  return [COLUMNAS_CSV, ...filas].map((fila) => fila.map(celdaCsv).join(";")).join("\r\n");
}
