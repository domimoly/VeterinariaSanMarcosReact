import { vi } from "vitest";
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  desdeApi,
  ETIQUETAS_ROL,
  listarUsuarios,
} from "./usuarioService";

const respuesta = (cuerpo, estado = 200) =>
  Promise.resolve({ ok: true, status: estado, json: () => Promise.resolve(cuerpo) });

const deLaApi = {
  id: 5,
  nombre: "Ana Pérez",
  correo: "ana@correo.cl",
  rol: "TUTOR",
  activo: true,
  creadoEn: "2026-02-15T10:30:00",
};

const ultimaPeticion = () => {
  const [url, opciones] = fetch.mock.calls.at(-1);
  return { url, opciones };
};

describe("usuarioService", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("convierte una cuenta de la API y deja solo el día del registro", () => {
    expect(desdeApi(deLaApi)).toEqual({
      id: 5,
      nombre: "Ana Pérez",
      correo: "ana@correo.cl",
      rol: "TUTOR",
      activo: true,
      registro: "2026-02-15",
    });
  });

  it("tolera cuentas antiguas sin fecha de registro", () => {
    expect(desdeApi({ ...deLaApi, creadoEn: null }).registro).toBe("");
  });

  it("tiene una etiqueta para cada rol", () => {
    expect(ETIQUETAS_ROL).toEqual({ TUTOR: "Tutor", RECEPCIONISTA: "Recepcionista", ADMINISTRADOR: "Administrador" });
  });

  it("lista las cuentas desde ms-auth", async () => {
    fetch.mockReturnValue(respuesta([deLaApi]));

    const usuarios = await listarUsuarios();

    expect(ultimaPeticion().url).toBe("http://localhost:8082/api/usuarios");
    expect(usuarios).toHaveLength(1);
  });

  it("crea una cuenta con POST", async () => {
    fetch.mockReturnValue(respuesta(deLaApi, 201));

    await crearUsuario({ nombre: "Ana Pérez", correo: "ana@correo.cl", password: "secreta1", rol: "TUTOR" });

    const { url, opciones } = ultimaPeticion();
    expect(url).toBe("http://localhost:8082/api/usuarios");
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toEqual({
      nombre: "Ana Pérez",
      correo: "ana@correo.cl",
      password: "secreta1",
      rol: "TUTOR",
    });
  });

  it("al editar envía nombre y rol, y la contraseña solo si se escribió una", async () => {
    fetch.mockReturnValue(respuesta(deLaApi));

    await actualizarUsuario(5, { nombre: "Ana P.", rol: "RECEPCIONISTA", password: "" });
    expect(ultimaPeticion().url).toBe("http://localhost:8082/api/usuarios/5");
    expect(ultimaPeticion().opciones.method).toBe("PUT");
    expect(JSON.parse(ultimaPeticion().opciones.body)).toEqual({ nombre: "Ana P.", rol: "RECEPCIONISTA" });

    await actualizarUsuario(5, { nombre: "Ana P.", rol: "TUTOR", password: "nueva123" });
    expect(JSON.parse(ultimaPeticion().opciones.body)).toEqual({ nombre: "Ana P.", rol: "TUTOR", password: "nueva123" });
  });

  it("desactiva y reactiva con PUT", async () => {
    fetch.mockReturnValue(respuesta(deLaApi));

    await cambiarEstadoUsuario(5, false);
    expect(ultimaPeticion().url).toBe("http://localhost:8082/api/usuarios/5/desactivar");
    expect(ultimaPeticion().opciones.method).toBe("PUT");

    await cambiarEstadoUsuario(5, true);
    expect(ultimaPeticion().url).toBe("http://localhost:8082/api/usuarios/5/activar");
  });

  it("muestra el primer error de campo cuando ms-auth rechaza los datos", async () => {
    fetch.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ mensaje: "Datos inválidos", errores: { password: "La contraseña debe tener entre 6 y 64 caracteres" } }),
      })
    );

    await expect(crearUsuario({ nombre: "Ana", correo: "a@b.cl", password: "1", rol: "TUTOR" })).rejects.toMatchObject({
      message: "La contraseña debe tener entre 6 y 64 caracteres",
      estado: 400,
    });
  });
});
