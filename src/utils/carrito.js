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

export function pagoAprobado() {
  return Math.random() < 0.7;
}

export function crearNumeroOrden() {
  return String(Date.now()).slice(-8);
}
