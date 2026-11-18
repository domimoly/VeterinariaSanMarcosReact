// Lee un valor JSON guardado en localStorage. Si no existe, está dañado o no tiene
// el tipo esperado, devuelve el respaldo en vez de romper la página.
export function leerJSON(clave, respaldo) {
  try {
    const guardado = localStorage.getItem(clave);
    if (guardado === null) return respaldo;
    const valor = JSON.parse(guardado);
    if (valor === null || Array.isArray(valor) !== Array.isArray(respaldo)) return respaldo;
    return valor;
  } catch {
    return respaldo;
  }
}
