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