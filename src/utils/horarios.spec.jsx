// src/utils/horarios.spec.jsx
import { horasDelDia, validarHorario } from "./horarios";

describe("validarHorario", () => {
  const ahora = new Date("2026-10-05T08:00:00"); // se fija "hoy" para que la prueba no dependa del día en que se ejecute

  it("rechaza un domingo porque la clínica está cerrada", () => {
    const errores = validarHorario({
      fecha: "2026-10-11", // domingo
      hora: "10:00",
      duracionMin: 30,
      citasGuardadas: [],
      mascotaId: 1,
      ahora,
    });

    expect(errores.fecha).toBe("La clínica no atiende ese día");
  });

  // --- Pruebas agregadas tras analizar el informe de cobertura ---

  it("rechaza una segunda cita de la misma mascota el mismo día", () => {
    const citaExistente = { mascotaId: 1, fecha: "2026-10-12", hora: "09:30", duracionMin: 30, estado: "Pendiente" };

    const errores = validarHorario({
      fecha: "2026-10-12",
      hora: "15:00",
      duracionMin: 30,
      citasGuardadas: [citaExistente],
      mascotaId: 1,
      ahora,
    });

    expect(errores.fecha).toBe("Tu mascota ya tiene una cita ese día");
  });
});

describe("horasDelDia", () => {
  it("no ofrece inicios que crucen la hora de almuerzo ni el cierre cuando el servicio dura 90 minutos", () => {
    const horas = horasDelDia("2026-10-12", 90, [], new Date("2026-10-05T08:00:00")).map((opcion) => opcion.hora);

    expect(horas).toContain("11:30"); // termina justo a las 13:00
    expect(horas).not.toContain("12:00"); // terminaría después del cierre de la mañana
    expect(horas).toContain("16:30"); // termina justo a las 18:00
    expect(horas).not.toContain("17:00"); // terminaría después del cierre de la tarde
  });
});
