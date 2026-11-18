import { leerJSON } from "./almacenamiento";

describe("leerJSON", () => {
  beforeEach(() => localStorage.clear());

  it("devuelve el respaldo cuando la clave no existe", () => {
    expect(leerJSON("inexistente", ["demo"])).toEqual(["demo"]);
  });

  it("devuelve el valor guardado cuando es válido", () => {
    localStorage.setItem("lista", JSON.stringify([1, 2]));
    expect(leerJSON("lista", [])).toEqual([1, 2]);
  });

  it("devuelve el respaldo cuando el JSON está dañado", () => {
    localStorage.setItem("lista", "{no es json");
    expect(leerJSON("lista", ["demo"])).toEqual(["demo"]);
  });

  it("devuelve el respaldo cuando el tipo guardado no es el esperado", () => {
    localStorage.setItem("lista", JSON.stringify({ a: 1 }));
    expect(leerJSON("lista", [])).toEqual([]);
    localStorage.setItem("usuario", JSON.stringify([1]));
    expect(leerJSON("usuario", { nombre: "demo" })).toEqual({ nombre: "demo" });
  });

  it("devuelve el respaldo cuando se guardó null", () => {
    localStorage.setItem("usuario", "null");
    expect(leerJSON("usuario", { nombre: "demo" })).toEqual({ nombre: "demo" });
  });
});
