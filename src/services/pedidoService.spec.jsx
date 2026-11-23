import { vi } from "vitest";
import { cancelarPedido, crearPedido, desdeApi, entregarPedido, ETIQUETAS_ESTADO, listarPedidos } from "./pedidoService";

const respuesta = (cuerpo, estado = 200) =>
  Promise.resolve({ ok: true, status: estado, json: () => Promise.resolve(cuerpo) });

const deLaApi = {
  id: 7,
  numero: "00000007",
  estado: "PAGADO",
  total: 12600,
  creadoEn: "2026-11-20T10:15:30",
  clienteCorreo: "camila@example.cl",
  nombre: "Camila",
  apellidos: "Rojas",
  correo: "camila@example.cl",
  calle: "Los Crisantemos 123",
  departamento: null,
  region: "Región Metropolitana de Santiago",
  comuna: "Santiago",
  indicaciones: null,
  lineas: [{ codigo: "MED-001", nombre: "Amoxibay 250mg", precioUnitario: 4200, cantidad: 3, subtotal: 12600 }],
};

const ultimaPeticion = () => {
  const [url, opciones] = fetch.mock.calls.at(-1);
  return { url, opciones };
};

describe("pedidoService", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("tiene una etiqueta para cada estado", () => {
    expect(ETIQUETAS_ESTADO).toEqual({ PAGADO: "Pagado", ENTREGADO: "Entregado", CANCELADO: "Cancelado" });
  });

  it("convierte un pedido de la API separando la fecha y la hora", () => {
    const pedido = desdeApi(deLaApi);

    expect(pedido).toMatchObject({
      id: 7,
      numero: "00000007",
      fecha: "2026-11-20",
      hora: "10:15",
      departamento: "",
      indicaciones: "",
    });
    expect(pedido.lineas[0]).toEqual({ codigo: "MED-001", nombre: "Amoxibay 250mg", precioUnitario: 4200, cantidad: 3, subtotal: 12600 });
  });

  it("crea el pedido enviando solo código y cantidad (nunca el precio) y el nombre de la región", async () => {
    fetch.mockReturnValue(respuesta(deLaApi, 201));
    const datos = {
      nombre: "Camila",
      apellidos: "Rojas",
      correo: "camila@example.cl",
      calle: "Los Crisantemos 123",
      departamento: "",
      region: "rm",
      comuna: "Santiago",
      indicaciones: "",
    };

    const pedido = await crearPedido(datos, [{ codigo: "MED-001", cantidad: 3, precio: 1 }]);

    const { url, opciones } = ultimaPeticion();
    expect(url).toMatch(/\/pedidos$/);
    expect(opciones.method).toBe("POST");
    const cuerpo = JSON.parse(opciones.body);
    expect(cuerpo.lineas).toEqual([{ codigo: "MED-001", cantidad: 3 }]);
    expect(cuerpo.region).not.toBe("rm");
    expect(cuerpo.region).toMatch(/Metropolitana/);
    expect(pedido.numero).toBe("00000007");
  });

  it("lista los pedidos", async () => {
    fetch.mockReturnValue(respuesta([deLaApi]));

    const lista = await listarPedidos();

    expect(ultimaPeticion().url).toMatch(/\/pedidos$/);
    expect(lista[0].fecha).toBe("2026-11-20");
  });

  it("marca un pedido como entregado", async () => {
    fetch.mockReturnValue(respuesta({ ...deLaApi, estado: "ENTREGADO" }));

    const pedido = await entregarPedido(7);

    const { url, opciones } = ultimaPeticion();
    expect(url).toMatch(/\/pedidos\/7\/entregar$/);
    expect(opciones.method).toBe("PUT");
    expect(pedido.estado).toBe("ENTREGADO");
  });

  it("cancela un pedido", async () => {
    fetch.mockReturnValue(respuesta({ ...deLaApi, estado: "CANCELADO" }));

    const pedido = await cancelarPedido(7);

    expect(ultimaPeticion().url).toMatch(/\/pedidos\/7\/cancelar$/);
    expect(pedido.estado).toBe("CANCELADO");
  });

  it("traduce el error del servidor", async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: false, status: 409, json: () => Promise.resolve({ error: "No hay stock suficiente de Amoxibay 250mg" }) }));

    await expect(crearPedido({ region: "rm" }, [])).rejects.toThrow("No hay stock suficiente de Amoxibay 250mg");
  });
});
