// src/utils/horarios.spec.jsx
import { horasDelDia, validarHorario } from "./horarios";

describe("validarHorario", () => {
  const ahora = new Date("2026-10-05T08:00:00"); // se fija "hoy" para que la prueba no dependa del día en que se ejecute

  it("rechaza un domingo porque la clínica está cerrada", () => {
    const errores = validarHorario({
      fecha: "2026-10-11", // domingo
      hora: "10:00",
      libres: [],
      citasGuardadas: [],
      mascotaId: 1,
      ahora,
    });

    expect(errores.fecha).toBe("La clínica no atiende ese día");
  });

  it("rechaza una segunda cita de la misma mascota el mismo día", () => {
    const citaExistente = { mascotaId: 1, fecha: "2026-10-12", hora: "09:30", duracionMin: 30, estado: "Pendiente" };

    const errores = validarHorario({
      fecha: "2026-10-12",
      hora: "15:00",
      libres: ["15:00"],
      citasGuardadas: [citaExistente],
      mascotaId: 1,
      ahora,
    });

    expect(errores.fecha).toBe("Tu mascota ya tiene una cita ese día");
  });

  it("pide elegir día y hora cuando faltan", () => {
    const errores = validarHorario({ fecha: "", hora: "", libres: [], citasGuardadas: [], mascotaId: 1, ahora });

    expect(errores).toEqual({ fecha: "Selecciona un día", hora: "Selecciona una hora" });
  });

  it("rechaza una hora que ms-citas ya no informa como libre", () => {
    const errores = validarHorario({
      fecha: "2026-10-12",
      hora: "10:00",
      libres: ["09:00", "09:30"],
      citasGuardadas: [],
      mascotaId: 1,
      ahora,
    });

    expect(errores).toEqual({ hora: "Esa hora ya no está disponible, elige otra" });
  });

  it("acepta una hora libre en un día válido", () => {
    const errores = validarHorario({
      fecha: "2026-10-12",
      hora: "09:30",
      libres: ["09:00", "09:30"],
      citasGuardadas: [],
      mascotaId: 1,
      ahora,
    });

    expect(errores).toEqual({});
  });

  it("rechaza fechas pasadas y fechas más allá de las 4 semanas", () => {
    const base = { hora: "10:00", libres: ["10:00"], citasGuardadas: [], mascotaId: 1, ahora };

    expect(validarHorario({ ...base, fecha: "2026-10-02" }).fecha).toBe("No puedes elegir una fecha pasada");
    expect(validarHorario({ ...base, fecha: "2099-01-05" }).fecha).toMatch(/hasta 4 semanas/);
  });
});

describe("horasDelDia", () => {
  it("no ofrece inicios que crucen la hora de almuerzo ni el cierre cuando el servicio dura 90 minutos", () => {
    const horas = horasDelDia("2026-10-12", 90, []).map((opcion) => opcion.hora);

    expect(horas).toContain("11:30"); // termina justo a las 13:00
    expect(horas).not.toContain("12:00"); // terminaría después del cierre de la mañana
    expect(horas).toContain("16:30"); // termina justo a las 18:00
    expect(horas).not.toContain("17:00"); // terminaría después del cierre de la tarde
  });

  it("marca como disponibles solo las horas que ms-citas informa como libres", () => {
    const horas = horasDelDia("2026-10-12", 30, ["09:00", "14:30"]);

    expect(horas.find((h) => h.hora === "09:00").disponible).toBe(true);
    expect(horas.find((h) => h.hora === "14:30").disponible).toBe(true);
    expect(horas.find((h) => h.hora === "09:30").disponible).toBe(false);
  });
});
