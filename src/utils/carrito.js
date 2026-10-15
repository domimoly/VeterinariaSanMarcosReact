import { productos } from "../data/productos";

export function leerCarrito() {
  const guardado = localStorage.getItem("carritoVeterinariaSanMarcos");
  return guardado ? JSON.parse(guardado) : [];
}

export function guardarCarrito(carrito) {
  localStorage.setItem("carritoVeterinariaSanMarcos", JSON.stringify(carrito));
}

export function agregarProducto(carrito, codigo) {
  const producto = productos.find((p) => p.codigo === codigo);
  const itemExistente = carrito.find((item) => item.codigo === codigo);

  if (!itemExistente) return [...carrito, { codigo, cantidad: 1 }];
  if (itemExistente.cantidad >= producto.stock) return carrito;

  return carrito.map((item) => (item.codigo === codigo ? { ...item, cantidad: item.cantidad + 1 } : item));
}

export function cambiarCantidadProducto(carrito, codigo, cambio) {
  const producto = productos.find((p) => p.codigo === codigo);

  return carrito.map((item) => {
    const nuevaCantidad = item.cantidad + cambio;
    if (item.codigo !== codigo || nuevaCantidad < 1 || nuevaCantidad > producto.stock) return item;
    return { ...item, cantidad: nuevaCantidad };
  });
}

export function quitarProducto(carrito, codigo) {
  return carrito.filter((item) => item.codigo !== codigo);
}
