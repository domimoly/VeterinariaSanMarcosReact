import { vi } from "vitest";
import { actualizarMascota, crearMascota, desdeApi, eliminarMascota, haciaApi, listarMascotas } from "./mascotaService";

const respuesta = (cuerpo, estado = 200) =>
  Promise.resolve({ ok: true, status: estado, json: () => Promise.resolve(cuerpo) });

const deLaApi = {
  id: 7,
  tutorCorreo: "ana@correo.cl",
  nombre: "Max",
  especie: "Perro",
  raza: null,
  sexo: "Macho",
  pesoKg: 28,
  fechaNacimiento: "2021-03-10",
  esterilizada: true,
  observaciones: null,
};

const delFormulario = {
  nombre: "Max",
  especie: "Perro",
  raza: "Labrador",
  sexo: "Macho",
  fechaNacimiento: "2021-03-10",
  peso: "28",
  esterilizado: true,
  observaciones: "Alergia al pollo",
};

describe("mascotaService", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("convierte una mascota de la API al formato de los formularios", () => {
    expect(desdeApi(deLaApi)).toEqual({
      id: 7,
      nombre: "Max",
      especie: "Perro",
      raza: "",
      sexo: "Macho",
      fechaNacimiento: "2021-03-10",
      peso: 28,
      esterilizado: true,
      observaciones: "",
      tutorCorreo: "ana@correo.cl",
      registradaEn: "",
    });
  });

  it("conserva el día en que se registró la mascota", () => {
    expect(desdeApi({ ...deLaApi, registradaEn: "2026-11-02" }).registradaEn).toBe("2026-11-02");
  });

  it("convierte los datos del formulario al formato de la API", () => {
    expect(haciaApi(delFormulario)).toEqual({
      nombre: "Max",
      especie: "Perro",
      raza: "Labrador",
      sexo: "Macho",
      pesoKg: 28,
      fechaNacimiento: "2021-03-10",
      esterilizada: true,
      observaciones: "Alergia al pollo",
    });
  });

  it("una fecha de nacimiento vacía se envía como null", () => {
    expect(haciaApi({ ...delFormulario, fechaNacimiento: "" }).fechaNacimiento).toBeNull();
  });

  it("listarMascotas pide GET /mascotas y convierte cada elemento", async () => {
    fetch.mockReturnValue(respuesta([deLaApi]));
    const lista = await listarMascotas();
    expect(fetch.mock.calls[0][0]).toMatch(/\/mascotas$/);
    expect(lista[0].peso).toBe(28);
  });

  it("crearMascota envía POST con el formato de la API", async () => {
    fetch.mockReturnValue(respuesta(deLaApi, 201));
    const nueva = await crearMascota(delFormulario);
    const [, opciones] = fetch.mock.calls[0];
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body).pesoKg).toBe(28);
    expect(nueva.id).toBe(7);
  });

  it("actualizarMascota envía PUT a /mascotas/{id}", async () => {
    fetch.mockReturnValue(respuesta(deLaApi));
    await actualizarMascota(7, delFormulario);
    expect(fetch.mock.calls[0][0]).toMatch(/\/mascotas\/7$/);
    expect(fetch.mock.calls[0][1].method).toBe("PUT");
  });

  it("eliminarMascota envía DELETE a /mascotas/{id}", async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }));
    await eliminarMascota(7);
    expect(fetch.mock.calls[0][0]).toMatch(/\/mascotas\/7$/);
    expect(fetch.mock.calls[0][1].method).toBe("DELETE");
  });
});
