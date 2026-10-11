// src/utils/fechas.spec.jsx
import { vi } from "vitest";
import { estadoControl } from "./fechas";

describe("estadoControl", () => {
  beforeEach(() => {
    // Se simula el reloj: la función usa la fecha de hoy y la prueba debe dar siempre lo mismo
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T10:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("marca como 'pronto' una dosis que vence en 15 días", () => {
    expect(estadoControl("2026-10-25")).toBe("pronto");
  });
});
