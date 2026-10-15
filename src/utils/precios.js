// 4200 -> "$4.200"
export function formatearPrecio(valor) {
  return `$${valor.toLocaleString("es-CL")}`;
}
