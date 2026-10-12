import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistorialMascota from "./HistorialMascota";

describe("HistorialMascota", () => {
  const mascotas = [
    { id: 1, nombre: "Max", especie: "Perro" },
    { id: 2, nombre: "Luna", especie: "Gato" },
  ];

  // Fechas lejanas: las vacunas quedan "al día" sin importar cuándo se ejecute la prueba
  const fichas = {
    1: {
      vacunas: [{ id: 1, nombre: "Séxtuple canina", fecha: "2098-01-01", proximaDosis: "2099-01-01" }],
      desparasitaciones: [],
      consultas: [],
    },
    2: {
      vacunas: [{ id: 1, nombre: "Triple felina", fecha: "2098-01-01", proximaDosis: "2099-01-01" }],
      desparasitaciones: [],
      consultas: [],
    },
  };

  it("cambia la ficha mostrada al elegir otra mascota", async () => {
    const usuario = userEvent.setup();
    render(<HistorialMascota mascotas={mascotas} fichas={fichas} />);

    expect(screen.getByText("Séxtuple canina")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Mascota"), "2");

    expect(screen.getByText("Triple felina")).toBeInTheDocument();
    expect(screen.queryByText("Séxtuple canina")).not.toBeInTheDocument();
  });
});
