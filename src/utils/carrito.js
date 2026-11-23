// El carrito vive en el navegador (localStorage) hasta que se paga: solo guarda código y cantidad.
// Los precios y el stock siempre se leen de la API, así nunca quedan desactualizados.
const CLAVE = "carritoVeterinariaSanMarcos";
const EVENTO = "carrito-actualizado";

export function leerCarrito() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    const carrito = guardado ? JSON.parse(guardado) : [];
    return Array.isArray(carrito) ? carrito : [];
  } catch {
    return [];
  }
}

export function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE, JSON.stringify(carrito));
  // Avisa a otras partes de la página (por ejemplo el contador del menú)
  window.dispatchEvent(new Event(EVENTO));
}

// "stock" es el máximo que se puede llevar de ese producto
export function agregarProducto(carrito, codigo, stock = Infinity) {
  const itemExistente = carrito.find((item) => item.codigo === codigo);

  if (!itemExistente) return stock >= 1 ? [...carrito, { codigo, cantidad: 1 }] : carrito;
  if (itemExistente.cantidad >= stock) return carrito;

  return carrito.map((item) => (item.codigo === codigo ? { ...item, cantidad: item.cantidad + 1 } : item));
}

// Suma o resta unidades sin bajar de 1 ni pasar del stock
export function cambiarCantidad(carrito, codigo, cambio, stock = Infinity) {
  return carrito.map((item) => {
    if (item.codigo !== codigo) return item;
    return { ...item, cantidad: Math.min(Math.max(item.cantidad + cambio, 1), stock) };
  });
}

export function quitarProducto(carrito, codigo) {
  return carrito.filter((item) => item.codigo !== codigo);
}

// Deja el carrito de acuerdo con el catálogo actual: quita lo que ya no se vende o no tiene stock
// y baja la cantidad al stock disponible. Si no hay nada que cambiar devuelve el mismo carrito.
export function ajustarAlCatalogo(carrito, productos) {
  const ajustado = carrito
    .map((item) => {
      const producto = productos.find((p) => p.codigo === item.codigo);
      return producto ? { ...item, cantidad: Math.min(item.cantidad, producto.stock) } : null;
    })
    .filter((item) => item && item.cantidad >= 1);

  const sinCambios =
    ajustado.length === carrito.length &&
    ajustado.every((item, i) => item.codigo === carrito[i].codigo && item.cantidad === carrito[i].cantidad);
  return sinCambios ? carrito : ajustado;
}

export function contarUnidades(carrito) {
  return carrito.reduce((suma, item) => suma + item.cantidad, 0);
}

export function unidadesEnCarrito() {
  return contarUnidades(leerCarrito());
}

// Para useSyncExternalStore: se avisa cuando el carrito cambia en esta pestaña o en otra
export function suscribirCarrito(avisar) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

// El pago es una simulación: se aprueba el 70 % de las veces
export function pagoAprobado() {
  return Math.random() < 0.7;
}
