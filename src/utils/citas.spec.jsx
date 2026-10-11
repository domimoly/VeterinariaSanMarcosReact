// src/utils/citas.spec.jsx
import { servicioAplica } from "./citas";

describe("servicioAplica", () => {
  const vacunaFelina = {
    especies: ["Gato"],
    sexo: null,
    pesoMin: null,
    pesoMax: null,
    soloNoEsterilizado: false,
  };

  it("no ofrece una vacuna felina a un perro", () => {
    const perro = { especie: "Perro", sexo: "Macho", peso: 20, esterilizado: false };

    expect(servicioAplica(vacunaFelina, perro)).toBe(false);
  });

  // --- Pruebas agregadas tras analizar el informe de cobertura ---

  it("no ofrece la esterilización de hembras a un macho", () => {
    const esterilizacionHembra = { ...vacunaFelina, especies: ["Perro"], sexo: "Hembra", soloNoEsterilizado: true };
    const macho = { especie: "Perro", sexo: "Macho", peso: 20, esterilizado: false };

    expect(servicioAplica(esterilizacionHembra, macho)).toBe(false);
  });

  it("ofrece la desparasitación para perros grandes solo si pesan más de 25 kg", () => {
    const antiparasitarioGrande = { ...vacunaFelina, especies: ["Perro"], pesoMin: 25.01 };
    const perroGrande = { especie: "Perro", sexo: "Macho", peso: 28, esterilizado: false };
    const perroMediano = { ...perroGrande, peso: 15 };

    expect(servicioAplica(antiparasitarioGrande, perroGrande)).toBe(true);
    expect(servicioAplica(antiparasitarioGrande, perroMediano)).toBe(false);
  });

  it("no ofrece esterilizar a una mascota que ya está esterilizada", () => {
    const esterilizacion = { ...vacunaFelina, especies: ["Perro"], soloNoEsterilizado: true };
    const esterilizado = { especie: "Perro", sexo: "Macho", peso: 20, esterilizado: true };

    expect(servicioAplica(esterilizacion, esterilizado)).toBe(false);
  });
});
