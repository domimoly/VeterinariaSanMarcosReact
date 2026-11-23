import { solicitar } from "./http";

// Catálogo de la tienda (ms-productos). Verlo es público; crear, editar y eliminar es solo del ADMINISTRADOR.
const PRODUCTOS_URL = import.meta.env.VITE_PRODUCTOS_API_URL ?? "http://localhost:8087/api";

export const CATEGORIAS = ["Medicamento", "Antiparasitario", "Accesorio"];

export function desdeApi(p) {
  return {
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    categoria: p.categoria,
    descripcion: p.descripcion ?? "",
    precio: p.precio,
    stock: p.stock,
    imagen: p.imagen ?? "",
    activo: p.activo !== false,
  };
}

// El administrador puede pedir también los productos desactivados
export async function listarProductos({ incluirInactivos = false } = {}) {
  const consulta = incluirInactivos ? "?incluirInactivos=true" : "";
  const lista = await solicitar(PRODUCTOS_URL, `/productos${consulta}`);
  return lista.map(desdeApi);
}

function haciaApi({ codigo, nombre, categoria, descripcion, precio, stock, imagen, activo }) {
  return { codigo, nombre, categoria, descripcion, precio: Number(precio), stock: Number(stock), imagen, activo };
}

export async function crearProducto(datos) {
  return desdeApi(await solicitar(PRODUCTOS_URL, "/productos", { method: "POST", body: JSON.stringify(haciaApi(datos)) }));
}

// El código no se puede cambiar: el backend lo rechaza si viene distinto
export async function actualizarProducto(id, datos) {
  return desdeApi(
    await solicitar(PRODUCTOS_URL, `/productos/${id}`, { method: "PUT", body: JSON.stringify(haciaApi(datos)) })
  );
}

export async function eliminarProducto(id) {
  await solicitar(PRODUCTOS_URL, `/productos/${id}`, { method: "DELETE" });
}
