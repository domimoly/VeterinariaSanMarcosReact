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
});
