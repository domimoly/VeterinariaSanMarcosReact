import { vi } from "vitest";
import {
  actualizarRegistro,
  agruparFicha,
  crearRegistro,
  desdeApi,
  eliminarRegistro,
  haciaApi,
  listarFicha,
} from "./fichaService";

const respuesta = (cuerpo, estado = 200) =>
  Promise.resolve({ ok: true, status: estado, json: () => Promise.resolve(cuerpo) });

const vacunaApi = { id: 1, mascotaId: 7, tipo: "VACUNA", fecha: "2026-01-10", nombre: "Antirrábica", proximaDosis: "2027-01-10" };
const desparasitacionApi = {
  id: 2,
  mascotaId: 7,
  tipo: "DESPARASITACION",
  fecha: "2026-02-01",
  nombre: "Antiparasitario interno",
  proximaDosis: "2026-05-01",
};
const consultaApi = {
  id: 3,
  mascotaId: 7,
  tipo: "CONSULTA",
  fecha: "2026-03-05",
  motivo: "Cojera",
  diagnostico: "Esguince leve",
  medicamentos: "Ninguno",
  veterinario: "Dr. Soto",
  proximoControl: null,
};

const ultimaPeticion = () => {
  const [url, opciones] = fetch.mock.calls.at(-1);
  return { url, opciones };
};

describe("fichaService", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("convierte una vacuna y una consulta de la API a la forma de los componentes", () => {
    expect(desdeApi(vacunaApi)).toEqual({ id: 1, nombre: "Antirrábica", fecha: "2026-01-10", proximaDosis: "2027-01-10" });
    expect(desdeApi(consultaApi)).toEqual({
      id: 3,
      fecha: "2026-03-05",
      motivo: "Cojera",
      diagnostico: "Esguince leve",
      medicamentos: "Ninguno",
      veterinario: "Dr. Soto",
      proximoControl: "",
    });
  });

  it("agrupa los registros en vacunas, desparasitaciones y consultas", () => {
    const ficha = agruparFicha([consultaApi, vacunaApi, desparasitacionApi]);

    expect(ficha.vacunas.map((v) => v.nombre)).toEqual(["Antirrábica"]);
    expect(ficha.desparasitaciones.map((d) => d.nombre)).toEqual(["Antiparasitario interno"]);
    expect(ficha.consultas.map((c) => c.motivo)).toEqual(["Cojera"]);
  });

  it("ignora un tipo de registro desconocido", () => {
    expect(agruparFicha([{ ...vacunaApi, tipo: "OTRO" }])).toEqual({ vacunas: [], desparasitaciones: [], consultas: [] });
  });

  it("convierte lo que llena el formulario al cuerpo que espera ms-fichas", () => {
    expect(haciaApi(7, "vacunas", { nombre: "Rabia", fecha: "2026-01-10", proximaDosis: "2027-01-10" })).toEqual({
      mascotaId: 7,
      tipo: "VACUNA",
      fecha: "2026-01-10",
      nombre: "Rabia",
      proximaDosis: "2027-01-10",
    });
    expect(haciaApi(7, "desparasitaciones", { nombre: "Pipeta", fecha: "2026-01-10", proximaDosis: "2026-04-10" }).tipo).toBe(
      "DESPARASITACION"
    );
    expect(
      haciaApi(7, "consultas", {
        fecha: "2026-03-05",
        motivo: "Cojera",
        diagnostico: "Esguince",
        medicamentos: "Ninguno",
        veterinario: "Dr. Soto",
        proximoControl: "",
      })
    ).toEqual({
      mascotaId: 7,
      tipo: "CONSULTA",
      fecha: "2026-03-05",
      motivo: "Cojera",
      diagnostico: "Esguince",
      medicamentos: "Ninguno",
      veterinario: "Dr. Soto",
      proximoControl: null,
    });
  });

  it("pide el historial de una mascota y lo agrupa", async () => {
    fetch.mockReturnValue(respuesta([vacunaApi, consultaApi]));

    const ficha = await listarFicha(7);

    expect(ultimaPeticion().url).toBe("http://localhost:8086/api/fichas?mascotaId=7");
    expect(ficha.vacunas).toHaveLength(1);
    expect(ficha.consultas).toHaveLength(1);
  });

  it("crea un registro con POST", async () => {
    fetch.mockReturnValue(respuesta(vacunaApi, 201));

    const creado = await crearRegistro(7, "vacunas", { nombre: "Antirrábica", fecha: "2026-01-10", proximaDosis: "2027-01-10" });

    const { url, opciones } = ultimaPeticion();
    expect(url).toBe("http://localhost:8086/api/fichas");
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toMatchObject({ tipo: "VACUNA", mascotaId: 7 });
    expect(creado.id).toBe(1);
  });

  it("edita un registro con PUT y lo elimina con DELETE", async () => {
    fetch.mockReturnValue(respuesta(vacunaApi));
    await actualizarRegistro(1, 7, "vacunas", { nombre: "Antirrábica", fecha: "2026-01-10", proximaDosis: "2027-01-10" });
    expect(ultimaPeticion().url).toBe("http://localhost:8086/api/fichas/1");
    expect(ultimaPeticion().opciones.method).toBe("PUT");

    fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }));
    expect(await eliminarRegistro(1)).toBeNull();
    expect(ultimaPeticion().opciones.method).toBe("DELETE");
  });

  it("entrega el mensaje de error de la API con su código de estado", async () => {
    fetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve({ error: "Esta mascota pertenece a otro tutor" }) })
    );

    await expect(listarFicha(7)).rejects.toMatchObject({ message: "Esta mascota pertenece a otro tutor", estado: 403 });
  });
});
