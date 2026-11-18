import { vi } from "vitest";
import { login, registrarTutor } from "./authService";

function responder(estado, cuerpo) {
  return Promise.resolve({ ok: estado >= 200 && estado < 300, status: estado, json: () => Promise.resolve(cuerpo) });
}

describe("authService", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("login envía las credenciales por POST y devuelve la sesión", async () => {
    const sesion = { token: "t", nombre: "Ana", correo: "ana@correo.cl", rol: "TUTOR" };
    fetch.mockReturnValue(responder(200, sesion));

    const resultado = await login({ correo: "ana@correo.cl", password: "secreto1" });

    expect(resultado).toEqual(sesion);
    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toMatch(/\/auth\/login$/);
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toEqual({ correo: "ana@correo.cl", password: "secreto1" });
  });

  it("login con credenciales inválidas lanza un error con el estado 401", async () => {
    fetch.mockReturnValue(responder(401, { mensaje: "Credenciales inválidas" }));
    await expect(login({ correo: "a@b.cl", password: "x" })).rejects.toMatchObject({
      message: "Credenciales inválidas",
      estado: 401,
    });
  });

  it("registrarTutor envía los datos a /auth/registro", async () => {
    fetch.mockReturnValue(responder(201, { token: "t", rol: "TUTOR" }));
    await registrarTutor({ nombre: "Ana", correo: "ana@correo.cl", password: "secreto1" });
    expect(fetch.mock.calls[0][0]).toMatch(/\/auth\/registro$/);
  });

  it("un correo repetido llega como error 409 con el mensaje del servidor", async () => {
    fetch.mockReturnValue(responder(409, { mensaje: "Ya existe una cuenta con ese correo" }));
    await expect(registrarTutor({ nombre: "Ana", correo: "a@b.cl", password: "secreto1" })).rejects.toMatchObject({
      estado: 409,
      message: "Ya existe una cuenta con ese correo",
    });
  });

  it("si el servidor no responde, el mensaje explica que no hay conexión", async () => {
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(login({ correo: "a@b.cl", password: "x" })).rejects.toThrow(/No se pudo conectar/);
  });

  it("si el error no trae JSON usa un mensaje por defecto", async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: false, status: 500, json: () => Promise.reject(new Error("sin json")) }));
    await expect(login({ correo: "a@b.cl", password: "x" })).rejects.toMatchObject({
      message: "No se pudo completar la solicitud.",
      estado: 500,
    });
  });
});
