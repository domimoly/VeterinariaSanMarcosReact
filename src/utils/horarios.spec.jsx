// src/utils/horarios.spec.jsx
import { validarHorario } from "./horarios";

describe("validarHorario", () => {
  it("rechaza un domingo porque la clínica está cerrada", () => {
    const errores = validarHorario({
      fecha: "2026-10-11", // domingo
      hora: "10:00",
      duracionMin: 30,
      citasGuardadas: [],
      mascotaId: 1,
      ahora: new Date("2026-10-05T08:00:00"), // se fija "hoy" para que la prueba no dependa del día en que se ejecute
    });

    expect(errores.fecha).toBe("La clínica no atiende ese día");
  });
});
