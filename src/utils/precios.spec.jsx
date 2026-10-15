import { formatearPrecio } from "./precios";

describe("formatearPrecio", () => {
  it("agrega el signo peso y el separador de miles", () => {
    expect(formatearPrecio(4200)).toBe("$4.200");
  });
});
