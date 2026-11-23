import { regiones } from "../data/Tutor/regiones";
import { solicitar } from "./http";

// Compras de la tienda (ms-pedidos). Hace falta sesión: cada cliente ve sus pedidos y el personal ve todos.
const PEDIDOS_URL = import.meta.env.VITE_PEDIDOS_API_URL ?? "http://localhost:8088/api";

export const ETIQUETAS_ESTADO = {
  PAGADO: "Pagado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function desdeApi(p) {
  return {
    id: p.id,
    numero: p.numero,
    estado: p.estado,
    total: p.total,
    fecha: p.creadoEn ? String(p.creadoEn).slice(0, 10) : "",
    hora: p.creadoEn ? String(p.creadoEn).slice(11, 16) : "",
    clienteCorreo: p.clienteCorreo,
    nombre: p.nombre,
    apellidos: p.apellidos,
    correo: p.correo,
    calle: p.calle,
    departamento: p.departamento ?? "",
    region: p.region,
    comuna: p.comuna,
    indicaciones: p.indicaciones ?? "",
    lineas: (p.lineas ?? []).map((l) => ({
      codigo: l.codigo,
      nombre: l.nombre,
      precioUnitario: l.precioUnitario,
      cantidad: l.cantidad,
      subtotal: l.subtotal,
    })),
  };
}

// "datos" viene del formulario del carrito (la región es el id, la API guarda su nombre);
// "items" son las líneas del carrito: solo código y cantidad, el precio lo pone el servidor.
export async function crearPedido(datos, items) {
  const cuerpo = {
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    correo: datos.correo,
    calle: datos.calle,
    departamento: datos.departamento,
    region: regiones.find((r) => r.id === datos.region)?.nombre ?? datos.region,
    comuna: datos.comuna,
    indicaciones: datos.indicaciones,
    lineas: items.map(({ codigo, cantidad }) => ({ codigo, cantidad })),
  };
  return desdeApi(await solicitar(PEDIDOS_URL, "/pedidos", { method: "POST", body: JSON.stringify(cuerpo) }));
}

export async function listarPedidos() {
  const lista = await solicitar(PEDIDOS_URL, "/pedidos");
  return lista.map(desdeApi);
}

export async function entregarPedido(id) {
  return desdeApi(await solicitar(PEDIDOS_URL, `/pedidos/${id}/entregar`, { method: "PUT" }));
}

export async function cancelarPedido(id) {
  return desdeApi(await solicitar(PEDIDOS_URL, `/pedidos/${id}/cancelar`, { method: "PUT" }));
}
