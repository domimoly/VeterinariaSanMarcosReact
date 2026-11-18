import { vi } from "vitest";
import { solicitar } from "./http";
import { guardarSesion, obtenerToken } from "../utils/sesion";

const responder = (estado, cuerpo) =>
  Promise.resolve({ ok: estado >= 200 && estado < 300, status: estado, json: () => Promise.resolve(cuerpo) });

describe("solicitar", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("envía el token de la sesión en el encabezado Authorization", async () => {
    guardarSesion({ token: "abc", nombre: "Ana", correo: "a@b.cl", rol: "TUTOR" });
    fetch.mockReturnValue(responder(200, [1]));

    const datos = await solicitar("http://api/x", "/cosas");

    expect(datos).toEqual([1]);
    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toBe("http://api/x/cosas");
    expect(opciones.headers.Authorization).toBe("Bearer abc");
    expect(opciones.headers["Content-Type"]).toBe("application/json");
  });

  it("sin sesión no envía Authorization", async () => {
    fetch.mockReturnValue(responder(200, {}));
    await solicitar("http://api/x", "/cosas");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("una respuesta 204 devuelve null", async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }));
    expect(await solicitar("http://api/x", "/cosas/1", { method: "DELETE" })).toBeNull();
  });

  it("un 401 cierra la sesión y avisa con el estado 401", async () => {
    guardarSesion({ token: "vencido", nombre: "Ana", correo: "a@b.cl", rol: "TUTOR" });
    fetch.mockReturnValue(responder(401, {}));

    await expect(solicitar("http://api/x", "/cosas")).rejects.toMatchObject({ estado: 401 });
    expect(obtenerToken()).toBeNull();
  });

  it("usa el mensaje de error que entrega el microservicio", async () => {
    fetch.mockReturnValue(responder(403, { error: "Esta mascota pertenece a otro tutor" }));
    await expect(solicitar("http://api/x", "/cosas")).rejects.toMatchObject({
      message: "Esta mascota pertenece a otro tutor",
      estado: 403,
    });
  });

  it("si el servidor no responde explica que no hay conexión", async () => {
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(solicitar("http://api/x", "/cosas")).rejects.toThrow(/No se pudo conectar/);
  });
});
