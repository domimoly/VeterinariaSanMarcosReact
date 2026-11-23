import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("../services/authService", () => ({ renovarToken: vi.fn() }));

import { renovarToken } from "../services/authService";
import { obtenerToken, guardarSesion } from "../utils/sesion";
import { REVISION_MS, useRenovacionSesion } from "./useRenovacionSesion";

function tokenQueVence(enMs) {
  const carga = btoa(JSON.stringify({ exp: Math.floor((Date.now() + enMs) / 1000) }));
  return `cabecera.${carga}.firma`;
}

const usuario = { nombre: "Ana", correo: "ana@correo.cl", rol: "TUTOR" };

describe("useRenovacionSesion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    renovarToken.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it("no hace nada si el token todavía dura más de 5 minutos", async () => {
    guardarSesion({ ...usuario, token: tokenQueVence(30 * 60 * 1000) });
    renderHook(() => useRenovacionSesion());
    await vi.advanceTimersByTimeAsync(REVISION_MS);
    expect(renovarToken).not.toHaveBeenCalled();
  });

  it("renueva el token cuando faltan menos de 5 minutos", async () => {
    const nuevo = tokenQueVence(60 * 60 * 1000);
    guardarSesion({ ...usuario, token: tokenQueVence(2 * 60 * 1000) });
    renovarToken.mockResolvedValue({ ...usuario, token: nuevo });
    renderHook(() => useRenovacionSesion());
    await vi.advanceTimersByTimeAsync(REVISION_MS);
    expect(renovarToken).toHaveBeenCalledTimes(1);
    expect(obtenerToken()).toBe(nuevo);
  });

  it("cierra la sesión si la renovación falla", async () => {
    guardarSesion({ ...usuario, token: tokenQueVence(2 * 60 * 1000) });
    renovarToken.mockRejectedValue(new Error("rechazado"));
    renderHook(() => useRenovacionSesion());
    await vi.advanceTimersByTimeAsync(REVISION_MS);
    expect(obtenerToken()).toBeNull();
  });

  it("cierra la sesión si el token ya venció", async () => {
    guardarSesion({ ...usuario, token: tokenQueVence(-1000) });
    renderHook(() => useRenovacionSesion());
    await vi.advanceTimersByTimeAsync(REVISION_MS);
    expect(renovarToken).not.toHaveBeenCalled();
    expect(obtenerToken()).toBeNull();
  });

  it("no hace nada sin sesión", async () => {
    renderHook(() => useRenovacionSesion());
    await vi.advanceTimersByTimeAsync(REVISION_MS);
    expect(renovarToken).not.toHaveBeenCalled();
  });
});
