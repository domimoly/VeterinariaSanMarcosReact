import { esRunValido, normalizarRun } from "./run";

describe("RUN chileno", () => {
  it("acepta puntos, guion y minúscula, y lo entrega normalizado", () => {
    expect(normalizarRun("12.345.678-5")).toBe("12345678-5");
    expect(normalizarRun("123456785")).toBe("12345678-5");
    expect(normalizarRun("10000013-k")).toBe("10000013-K");
  });

  it("acepta RUN de siete dígitos", () => {
    expect(normalizarRun("7654321-6")).toBe("7654321-6");
  });

  it("rechaza un dígito verificador incorrecto", () => {
    expect(esRunValido("12345678-K")).toBe(false);
    expect(esRunValido("12345678-4")).toBe(false);
  });

  it("rechaza lo que no tiene forma de RUN", () => {
    expect(esRunValido("")).toBe(false);
    expect(esRunValido("abc")).toBe(false);
    expect(esRunValido("1-9")).toBe(false);
    expect(esRunValido(null)).toBe(false);
  });
});
