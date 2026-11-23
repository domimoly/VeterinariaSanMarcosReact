// src/utils/carrito.spec.jsx
import { vi } from "vitest";
import {
  agregarProducto,
  ajustarAlCatalogo,
  cambiarCantidad,
  contarUnidades,
  guardarCarrito,
  leerCarrito,
  pagoAprobado,
  quitarProducto,
  suscribirCarrito,
  unidadesEnCarrito,
} from "./carrito";

const CLAVE = "carritoVeterinariaSanMarcos";

describe("carrito", () => {
  beforeEach(() => localStorage.clear());

  it("agrega un producto nuevo con cantidad 1", () => {
    expect(agregarProducto([], "MED-001")).toEqual([{ codigo: "MED-001", cantidad: 1 }]);
  });

  it("suma una unidad a un producto que ya estaba", () => {
    expect(agregarProducto([{ codigo: "MED-001", cantidad: 2 }], "MED-001", 10)).toEqual([
      { codigo: "MED-001", cantidad: 3 },
    ]);
  });

  it("no supera el stock del producto", () => {
    const carrito = [{ codigo: "MED-009", cantidad: 4 }];
    expect(agregarProducto(carrito, "MED-009", 4)).toBe(carrito);
  });

  it("no agrega un producto sin stock", () => {
    expect(agregarProducto([], "MED-009", 0)).toEqual([]);
  });

  it("cambia la cantidad sin bajar de 1 ni pasar del stock", () => {
    const carrito = [{ codigo: "A", cantidad: 2 }, { codigo: "B", cantidad: 1 }];

    expect(cambiarCantidad(carrito, "A", 1, 5)).toEqual([{ codigo: "A", cantidad: 3 }, { codigo: "B", cantidad: 1 }]);
    expect(cambiarCantidad(carrito, "A", -5, 5)[0].cantidad).toBe(1);
    expect(cambiarCantidad(carrito, "A", 10, 5)[0].cantidad).toBe(5);
  });

  it("quita un producto del carrito", () => {
    expect(quitarProducto([{ codigo: "A", cantidad: 1 }, { codigo: "B", cantidad: 2 }], "A")).toEqual([
      { codigo: "B", cantidad: 2 },
    ]);
  });

  it("cuenta las unidades de todo el carrito", () => {
    expect(contarUnidades([{ codigo: "A", cantidad: 2 }, { codigo: "B", cantidad: 3 }])).toBe(5);
    expect(contarUnidades([])).toBe(0);
  });

  it("ajusta el carrito al catálogo: quita lo retirado y limita al stock", () => {
    const productos = [
      { codigo: "A", stock: 2 },
      { codigo: "B", stock: 0 },
    ];
    const carrito = [
      { codigo: "A", cantidad: 5 },
      { codigo: "B", cantidad: 1 },
      { codigo: "C", cantidad: 1 },
    ];

    expect(ajustarAlCatalogo(carrito, productos)).toEqual([{ codigo: "A", cantidad: 2 }]);
  });

  it("devuelve el mismo carrito cuando no hay nada que ajustar", () => {
    const carrito = [{ codigo: "A", cantidad: 1 }];
    expect(ajustarAlCatalogo(carrito, [{ codigo: "A", stock: 3 }])).toBe(carrito);
  });

  it("guarda el carrito serializado en localStorage y avisa del cambio", () => {
    const espia = vi.spyOn(Storage.prototype, "setItem");
    const aviso = vi.fn();
    const darseDeBaja = suscribirCarrito(aviso);
    const carrito = [{ codigo: "MED-001", cantidad: 2 }];

    guardarCarrito(carrito);

    expect(espia).toHaveBeenCalledWith(CLAVE, JSON.stringify(carrito));
    expect(aviso).toHaveBeenCalledTimes(1);
    expect(leerCarrito()).toEqual(carrito);
    expect(unidadesEnCarrito()).toBe(2);

    darseDeBaja();
    guardarCarrito([]);
    expect(aviso).toHaveBeenCalledTimes(1);
    espia.mockRestore();
  });

  it("lee un carrito vacío si lo guardado está dañado o no es una lista", () => {
    localStorage.setItem(CLAVE, "{no es json");
    expect(leerCarrito()).toEqual([]);

    localStorage.setItem(CLAVE, JSON.stringify({ codigo: "A" }));
    expect(leerCarrito()).toEqual([]);
  });

  it("aprueba el pago cuando el azar cae bajo 0.7", () => {
    const espia = vi.spyOn(Math, "random").mockReturnValue(0.1);

    expect(pagoAprobado()).toBe(true);
    espia.mockRestore();
  });

  it("rechaza el pago cuando el azar cae sobre 0.7", () => {
    const espia = vi.spyOn(Math, "random").mockReturnValue(0.9);

    expect(pagoAprobado()).toBe(false);
    espia.mockRestore();
  });
});
