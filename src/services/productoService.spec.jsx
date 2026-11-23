import { vi } from "vitest";
import { actualizarProducto, CATEGORIAS, crearProducto, desdeApi, eliminarProducto, listarProductos } from "./productoService";

const respuesta = (cuerpo, estado = 200) =>
  Promise.resolve({ ok: true, status: estado, json: () => Promise.resolve(cuerpo) });

const deLaApi = {
  id: 3,
  codigo: "MED-003",
  nombre: "Metrobay 250mg",
  categoria: "Medicamento",
  descripcion: null,
  precio: 3900,
  stock: 20,
  imagen: null,
  activo: true,
};

const ultimaPeticion = () => {
  const [url, opciones] = fetch.mock.calls.at(-1);
  return { url, opciones };
};

describe("productoService", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("ofrece las categorías de la tienda", () => {
    expect(CATEGORIAS).toEqual(["Medicamento", "Antiparasitario", "Accesorio"]);
  });

  it("convierte un producto de la API y completa los campos opcionales", () => {
    expect(desdeApi(deLaApi)).toEqual({
      id: 3,
      codigo: "MED-003",
      nombre: "Metrobay 250mg",
      categoria: "Medicamento",
      descripcion: "",
      precio: 3900,
      stock: 20,
      imagen: "",
      activo: true,
    });
  });

  it("lista los productos visibles sin enviar parámetros", async () => {
    fetch.mockReturnValue(respuesta([deLaApi]));

    const lista = await listarProductos();

    expect(ultimaPeticion().url).toMatch(/\/productos$/);
    expect(lista).toHaveLength(1);
    expect(lista[0].codigo).toBe("MED-003");
  });

  it("pide también los ocultos cuando el administrador lo necesita", async () => {
    fetch.mockReturnValue(respuesta([deLaApi]));

    await listarProductos({ incluirInactivos: true });

    expect(ultimaPeticion().url).toMatch(/\/productos\?incluirInactivos=true$/);
  });

  it("crea un producto enviando el precio y el stock como números", async () => {
    fetch.mockReturnValue(respuesta(deLaApi, 201));

    await crearProducto({ codigo: "MED-003", nombre: "Metrobay 250mg", categoria: "Medicamento", descripcion: "", precio: "3900", stock: "20", imagen: "", activo: true });

    const { url, opciones } = ultimaPeticion();
    expect(url).toMatch(/\/productos$/);
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toMatchObject({ codigo: "MED-003", precio: 3900, stock: 20, activo: true });
  });

  it("actualiza un producto por id sin mandar campos ajenos", async () => {
    fetch.mockReturnValue(respuesta(deLaApi));

    await actualizarProducto(3, { ...desdeApi(deLaApi), precio: 4100 });

    const { url, opciones } = ultimaPeticion();
    expect(url).toMatch(/\/productos\/3$/);
    expect(opciones.method).toBe("PUT");
    const cuerpo = JSON.parse(opciones.body);
    expect(cuerpo.precio).toBe(4100);
    expect(cuerpo).not.toHaveProperty("id");
  });

  it("elimina un producto por id", async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204, json: () => Promise.reject(new Error("sin cuerpo")) }));

    await eliminarProducto(3);

    const { url, opciones } = ultimaPeticion();
    expect(url).toMatch(/\/productos\/3$/);
    expect(opciones.method).toBe("DELETE");
  });

  it("traduce el error del servidor", async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: false, status: 409, json: () => Promise.resolve({ error: "Ya existe un producto con el código MED-003" }) }));

    await expect(crearProducto(desdeApi(deLaApi))).rejects.toThrow("Ya existe un producto con el código MED-003");
  });
});
