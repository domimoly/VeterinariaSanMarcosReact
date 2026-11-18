import { vi } from "vitest";
import {
  cancelarCita,
  confirmarCita,
  crearCita,
  desdeApi,
  haciaApi,
  horasLibres,
  listarCitas,
  reagendarCita,
} from "./citaService";

const respuesta = (cuerpo, estado = 200) =>
  Promise.resolve({ ok: true, status: estado, json: () => Promise.resolve(cuerpo) });

const deLaApi = {
  id: 12,
  codigo: "SM-000012",
  tutorCorreo: "ana@correo.cl",
  mascotaId: 7,
  mascotaNombre: "Max",
  mascotaEspecie: "Perro",
  servicioCodigo: "consulta-general",
  servicioNombre: "Consulta General",
  duracionMin: 30,
  precio: 15000,
  fecha: "2026-10-12",
  hora: "10:30:00",
  telefono: "+56912345678",
  tutorNombre: "Ana Pérez Soto",
  correoContacto: "contacto@correo.cl",
  medioRecordatorio: "Teléfono",
  observaciones: null,
  estado: "Pendiente",
  nota: null,
  creadaEn: "2026-10-05T08:00:00",
};

const solicitud = {
  mascota: { id: 7, nombre: "Max", especie: "Perro" },
  servicio: { id: "consulta-general", nombre: "Consulta General" },
  fecha: "2026-10-12",
  hora: "10:30",
  observaciones: "Come poco",
  tutor: {
    nombre: "Ana",
    apellidos: "Pérez Soto",
    telefono: "+56912345678",
    correo: "contacto@correo.cl",
    medioRecordatorio: "Correo",
  },
};

const ultimaPeticion = () => {
  const [url, opciones] = fetch.mock.calls.at(-1);
  return { url, opciones };
};

describe("citaService", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("convierte una cita de la API al formato de los componentes", () => {
    expect(desdeApi(deLaApi)).toEqual({
      id: 12,
      codigo: "SM-000012",
      mascotaId: 7,
      mascotaNombre: "Max",
      especie: "Perro",
      servicioId: "consulta-general",
      servicioNombre: "Consulta General",
      duracion: "30 min",
      duracionMin: 30,
      precio: "$15.000",
      fecha: "2026-10-12",
      hora: "10:30",
      observaciones: "",
      tutor: {
        run: "",
        nombre: "Ana Pérez Soto",
        apellidos: "",
        telefono: "+56912345678",
        correo: "contacto@correo.cl",
        medioRecordatorio: "Teléfono",
      },
      tutorCorreo: "ana@correo.cl",
      estado: "Pendiente",
      nota: "",
      creadaEn: "2026-10-05T08:00:00",
    });
  });

  it("tolera citas antiguas sin los datos de contacto nuevos", () => {
    const antigua = {
      ...deLaApi,
      tutorNombre: null,
      correoContacto: null,
      medioRecordatorio: null,
      mascotaEspecie: null,
      precio: null,
    };

    const cita = desdeApi(antigua);

    expect(cita.tutor).toMatchObject({ nombre: "ana@correo.cl", correo: "ana@correo.cl", medioRecordatorio: "Correo" });
    expect(cita.especie).toBe("");
    expect(cita.precio).toBe("$0");
  });

  it("convierte la solicitud de los pasos al cuerpo que espera ms-citas", () => {
    expect(haciaApi(solicitud)).toEqual({
      mascotaId: 7,
      servicioCodigo: "consulta-general",
      fecha: "2026-10-12",
      hora: "10:30",
      telefono: "+56912345678",
      tutorNombre: "Ana Pérez Soto",
      correoContacto: "contacto@correo.cl",
      medioRecordatorio: "Correo",
      observaciones: "Come poco",
    });
  });

  it("lista las citas y las convierte", async () => {
    fetch.mockReturnValue(respuesta([deLaApi]));

    const citas = await listarCitas();

    expect(ultimaPeticion().url).toBe("http://localhost:8085/api/citas");
    expect(citas[0].hora).toBe("10:30");
  });

  it("crea la cita con POST", async () => {
    fetch.mockReturnValue(respuesta(deLaApi, 201));

    const creada = await crearCita(solicitud);

    const { url, opciones } = ultimaPeticion();
    expect(url).toBe("http://localhost:8085/api/citas");
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toMatchObject({ servicioCodigo: "consulta-general", mascotaId: 7 });
    expect(creada.codigo).toBe("SM-000012");
  });

  it("confirma, reagenda y cancela con PUT", async () => {
    fetch.mockReturnValue(respuesta(deLaApi));

    await confirmarCita(12);
    expect(ultimaPeticion().url).toBe("http://localhost:8085/api/citas/12/confirmar");
    expect(ultimaPeticion().opciones.method).toBe("PUT");

    await reagendarCita(12, { fecha: "2026-10-13", hora: "11:00", nota: "El médico no estará" });
    expect(ultimaPeticion().url).toBe("http://localhost:8085/api/citas/12/reagendar");
    expect(JSON.parse(ultimaPeticion().opciones.body)).toEqual({
      fecha: "2026-10-13",
      hora: "11:00",
      nota: "El médico no estará",
    });

    await cancelarCita(12);
    expect(ultimaPeticion().url).toBe("http://localhost:8085/api/citas/12/cancelar");
  });

  it("consulta las horas libres de un servicio en una fecha", async () => {
    fetch.mockReturnValue(respuesta(["09:00", "09:30:00"]));

    const horas = await horasLibres("2026-10-12", "consulta-general");

    expect(ultimaPeticion().url).toBe(
      "http://localhost:8085/api/citas/disponibilidad?fecha=2026-10-12&servicio=consulta-general"
    );
    expect(horas).toEqual(["09:00", "09:30"]);
  });

  it("entrega el mensaje de error de la API con su código de estado", async () => {
    fetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 409, json: () => Promise.resolve({ error: "No quedan cupos a las 10:00" }) })
    );

    await expect(crearCita(solicitud)).rejects.toMatchObject({ message: "No quedan cupos a las 10:00", estado: 409 });
  });
});
