// src/utils/fechas.js
export function formatearFecha(fechaIso) {
  return new Date(`${fechaIso}T00:00:00`).toLocaleDateString("es-CL");
}

// Devuelve "vencida", "pronto" (vence en 30 días o menos) o "aldia"
export function estadoControl(fechaIso) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(`${fechaIso}T00:00:00`);
  const dias = Math.ceil((fecha - hoy) / 86400000);

  if (dias < 0) return "vencida";
  if (dias <= 30) return "pronto";
  return "aldia";
}

export const etiquetasEstado = {
  vencida: "Vencida",
  pronto: "Vence pronto",
  aldia: "Al día",
};

// Fecha local en formato AAAA-MM-DD (toISOString usa UTC y puede adelantar el día en Chile)
export function fechaIsoLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function hoyIso() {
  return fechaIsoLocal(new Date());
}