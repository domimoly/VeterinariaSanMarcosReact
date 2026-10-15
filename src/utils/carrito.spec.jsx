// src/utils/carrito.spec.jsx
import { vi } from "vitest";
import { agregarProducto, crearNumeroOrden, guardarCarrito, pagoAprobado } from "./carrito";

describe("carrito", () => {
  it("agrega un producto nuevo con cantidad 1", () => {
    expect(agregarProducto([], "MED-001")).toEqual([{ codigo: "MED-001", cantidad: 1 }]);
  });

  it("no supera el stock del producto", () => {
    const carrito = [{ codigo: "MED-009", cantidad: 4 }]; // Vetmedin 2.5mg: stock 4
    expect(agregarProducto(carrito, "MED-009")).toEqual(carrito);
  });

  it("guarda el carrito serializado en localStorage", () => {
    // Espía: registra las llamadas a setItem sin cambiar su comportamiento
    const espia = vi.spyOn(Storage.prototype, "setItem");
    const carrito = [{ codigo: "MED-001", cantidad: 2 }];

    guardarCarrito(carrito);

    expect(espia).toHaveBeenCalledWith("carritoVeterinariaSanMarcos", JSON.stringify(carrito));
    espia.mockRestore();
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

  it("crea un número de orden de 8 dígitos", () => {
    expect(crearNumeroOrden()).toMatch(/^\d{8}$/);
  });
});
