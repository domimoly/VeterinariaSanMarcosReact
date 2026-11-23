import { useSyncExternalStore } from "react";
import { suscribirCarrito, unidadesEnCarrito } from "../utils/carrito";

// Cantidad de unidades en el carrito; se actualiza sola cuando alguien agrega o quita productos.
export function useCantidadCarrito() {
  return useSyncExternalStore(suscribirCarrito, unidadesEnCarrito, () => 0);
}
